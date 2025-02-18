import {
    UPLOAD_INFO,
    ALLOWED_TYPE,
    CHUNK_SIZE,
    API
} from './config';
import axios from 'axios';

;((doc) => {
    const oProgress = doc.querySelector('#uploadProgress');
    const oUploader = doc.querySelector('#videoUploader');
    const oInfo = doc.querySelector('#uploadInfo');
    const oBtn = doc.querySelector('#uploadBtn');
    
    let uploadedSize = 0;

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

        const { name, type, size } = file;
        const fileName = new Date().getTime() + '_' + name;
        let uploadedResult = null;
        //设置进度条最大值
        oProgress.max = size;
        oInfo.innerText = '';

        while( uploadedSize < size) {
            const fileChunk = file.slice(uploadedSize, uploadedSize + CHUNK_SIZE);
            const formData = createFormData({
                name,
                type,
                size,
                fileName,
                uploadedSize,
                file: fileChunk
            });
            try {
                uploadedResult = await axios.post(API.UPLOAD_VIDEO, formData);
                console.log(uploadedResult)
            } catch (e) {
                oInfo.innerText = `${UPLOAD_INFO.UPLOAD_FAILED}(${e.message})`;
                return;
            }
            uploadedSize += fileChunk.size;
            oProgress.value = uploadedSize;
        }
        oInfo.innerText = UPLOAD_INFO.UPLOAD_SUCCESS;
        oUploader.value = null;
        createVideo(uploadedResult.data.data.video_url)
    }

    function createFormData({
        name,
        type,
        size,
        fileName,
        uploadedSize,
        file
    }) {
        const fd = new FormData();
        fd.append('name', name);
        fd.append('type', type);
        fd.append('size', size);
        fd.append('fileName', fileName);
        fd.append('uploadedSize', uploadedSize);
        fd.append('file', file);
        return fd;
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