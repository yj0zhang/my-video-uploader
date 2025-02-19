import {
    UPLOAD_INFO,
    ALLOWED_TYPE,
    CHUNK_SIZE,
    API,
    PROMISE_SIZE
} from './config';

;((doc) => {
    const oProgress = doc.querySelector('#uploadProgress');
    const oUploader = doc.querySelector('#videoUploader');
    const oInfo = doc.querySelector('#uploadInfo');
    const oBtn = doc.querySelector('#uploadBtn');

    const init = () => {
        bindEvent();
    }

    function bindEvent() {
        oBtn.addEventListener('click', uploadVideo, false);
    }

    async function uploadVideo() {
        // console.log(oUploader.files);
        const { files: [file] } = oUploader;
        console.log(file);
        if(!file) {
            oInfo.innerText = UPLOAD_INFO.NO_FILE;
            return;
        }
        if(!ALLOWED_TYPE[file.type]){
            //类型判断
            oInfo.innerText = UPLOAD_INFO.INVALID_TYPE;
            return;
        }
        oInfo.innerText = '';
        // 开始上传
        const uploadedResult = await uploadHandler(file);
        oInfo.innerText = UPLOAD_INFO.UPLOAD_SUCCESS;
        //清空文件
        oUploader.value = null;
        //播放视频
        createVideo(uploadedResult.data.video_url)
    }

    async function uploadHandler(file) {
        //计算chunk个数
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        //计算文件hash
        const fileHash = await calculateFileHash(file);
        //检查已上传的chunks有哪些，返回chunkIndex数组
        const uploadedChunkIndexs = await checkUploadedChunks(fileHash);
        //设置进度条最大值
        oProgress.max = totalChunks;
        //更新已上传的进度
        oProgress.value = Number(oProgress.value) + uploadedChunkIndexs.length;
        // 上传
        await uploadChunks({
            file,
            uploadedChunkIndexs,
            totalChunks,
            fileHash,
            type: file.type
        });

        // 合并切片
        return await mergeChunks(fileHash, totalChunks, file.name);
    }

    async function calculateFileHash(file) {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        return Array.from(new Uint8Array(hashBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
    }

    async function checkUploadedChunks(fileHash) {
        try {
            const response = await fetch(`${API.CHECK_CHUNKS}?fileHash=${fileHash}`);
            const data = await response.json();
            return data.uploadedChunkIndexs;
        } catch (error) {
            console.log('检查已上传的切片报错', error)
        }
    }

    /**
     * 上传切片，跳过已上传的切片
     * @param {Array<Blob>} chunks - 切片数组
     * @param {string} fileName - 文件名
     */
    async function uploadChunks({
        file,
        uploadedChunkIndexs,
        totalChunks,
        fileHash,
        type,
    }) {
        const uploadPromises = [];
        for(let i = 0; i < totalChunks; i ++) {
            if (uploadedChunkIndexs.includes(i)) {
                continue;//跳过已上传的切片
            }
            const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
            //并发上传
            uploadPromises.push(doUpload({
                file: chunk,
                fileName: file.name,
                chunkIndex: i,
                fileHash,
                totalChunks,
                type
            }));
        }
        try {
            await Promise.all(uploadPromises);
        } catch (e) {
            uploadHandler(file);//重试
            throw e
        }
        console.log('所有切片上传完成');
    }

    async function doUpload({
        file,
        fileName,
        fileHash,
        chunkIndex,
        totalChunks,
        type,
    }) {
        const formData = createFormData({
            file,
            fileName,
            fileHash,
            chunkIndex,
            totalChunks,
            type,
        })
        console.log(formData.get('fileName'), formData.get('chunkIndex'))
        await fetch(API.UPLOAD_VIDEO, {
            method: 'POST',
            body: formData
        });
        oProgress.value = Number(oProgress.value) + 1;
    }

    function createFormData({
        file,
        fileName,
        fileHash,
        chunkIndex,
        totalChunks,
        type,
    }) {
        const fd = new FormData();
        fd.append('file',file);
        fd.append('fileName',fileName);
        fd.append('chunkIndex',chunkIndex);
        fd.append('totalChunks',totalChunks);
        fd.append('fileHash', fileHash);
        fd.append('type',type);
        return fd;
    }

    async function mergeChunks(fileHash, totalChunks, fileName) {
        try {
          const response = await fetch(API.MERGE_VIDEO, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fileHash, totalChunks, fileName }),
          });
          const result = await response.json();
          console.log('文件合并成功:', result);
          return result;
        } catch (error) {
          console.error('文件合并失败:', error);
        }
      }

    function createVideo(src) {
        const oVideo = document.createElement('video');
        oVideo.controls = true;
        oVideo.width = 500;
        oVideo.src = src;
        document.body.appendChild(oVideo);
    }
    init();
    
})(document);