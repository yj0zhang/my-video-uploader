const express = require('express');
const bodyParser = require('body-parser');
const uploader = require('express-fileupload');
const fs = require('fs');
const path = require('path');

const { UPLOAD_INFO, ALLOWED_TYPE } = require('./config');

const app = express();

const PORT = 8000;

//使用中间件
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(uploader());
app.use('/', express.static('upload_temp'));

//确保上传文件的目录存在
const UPLOAD_DIR = path.resolve(__dirname, 'upload_temp');
if(!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR)
}

const getChunkName = (fileHash, index) => {
    return `${fileHash}-${index}`
}

//所有请求允许跨域
app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});

// 检查已上传的切片
app.get('/check_chunks', (req, res) => {
    const fileHash = req.query.fileHash;
    const uploadedChunkIndexs = fs.readdirSync(UPLOAD_DIR)
                                .filter(filename => filename.startsWith(fileHash))
                                .map(filename => parseInt(filename.split('-')[1]));
    res.json({uploadedChunkIndexs});
})

app.post('/upload_video', async (req, res) => {
    // await new Promise((resolve, reject) => {
    //     setTimeout(() => {
    //         resolve()
    //     }, 2000)
    // })
    const { file } = req.files;
    const {
        fileHash,
        chunkIndex,
        type
    } = req.body;

    if(!file) {
        res.send(UPLOAD_INFO.NO_FILE);
        return;
    }
    if(!ALLOWED_TYPE[type]) {
        res.send(UPLOAD_INFO.INVALID_TYPE);
        return;
    }
    console.log('upload_video',req.body)
    const chunkPath = path.resolve(UPLOAD_DIR, getChunkName(fileHash, chunkIndex));
    fs.writeFileSync(chunkPath, file.data)
    res.send(UPLOAD_INFO.APPENDED)
});

app.post('/merge_video', (req, res) => {
    const { fileHash, totalChunks, fileName } = req.body;

    const ext = path.extname(fileName);
    const filePath = path.resolve(UPLOAD_DIR, fileHash+ext);
    const writeStream = fs.createWriteStream(filePath);

    for(let i = 0; i < totalChunks; i ++) {
        const chunkPath = path.resolve(UPLOAD_DIR, getChunkName(fileHash, i));
        if(!fs.existsSync(chunkPath)) {
            // 切片被删了，报错
            res.send(UPLOAD_INFO.CHUNK_LOSE);
            return
        }
        const chunk = fs.readFileSync(chunkPath);
        writeStream.write(chunk);
        fs.unlinkSync(chunkPath);
    }
    writeStream.end();
    res.send({
        ...UPLOAD_INFO.MERGED,
        data: {
            video_url: 'http://localhost:8000/' + fileHash+ext,
        }
    })
});

app.listen(PORT, () => {
    console.log('server is running on ' + PORT);
});