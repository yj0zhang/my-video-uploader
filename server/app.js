const express = require('express');
const bodyParser = require('body-parser');
const uploader = require('express-fileupload');
const {
    extname,
    resolve
} = require('path');
const {
    existsSync,
    appendFileSync,
    writeFileSync
} = require('fs');

const { UPLOAD_INFO,ALLOWED_TYPE } = require('./config');

const app = express();

const PORT = 8000;

//使用中间件
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(uploader());
app.use('/', express.static('upload_temp'));

//所有请求允许跨域
app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST,GET');
    next();
});

app.post('/upload_video', (req, res) => {
    const {
        name,
        type,
        size,
        fileName,
        uploadedSize,
    } = req.body;
    //express-fileupload会把文件放在req.files上
    console.log(req.files)
    const { file } = req.files;

    if(!file) {
        res.send(UPLOAD_INFO.NO_FILE);
        return;
    }
    if(!ALLOWED_TYPE[type]) {
        res.send(UPLOAD_INFO.INVALID_TYPE);
        return;
    }
    const filename = fileName + extname(name);
    const filePath = resolve(__dirname, './upload_temp/' + filename);
    if(uploadedSize !== '0') {
        //文件已存在，
        if(!existsSync(filePath)) {
            //文件因意料之外的原因丢失了
            res.send(UPLOAD_INFO.NO_FILE_EXISTS);
            return;
        }
        appendFileSync(filePath, file.data);
        res.send({
            ...UPLOAD_INFO.APPENDED,
            data: {
                video_url: 'http://localhost:8000/' + filename,
            }
        });
        return;
    }
    //第一个切片上传，写文件
    writeFileSync(filePath, file.data);
    res.send(UPLOAD_INFO.CREATED);
});

app.listen(PORT, () => {
    console.log('server is running on ' + PORT);
});