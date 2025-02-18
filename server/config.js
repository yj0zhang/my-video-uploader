module.exports = {
    UPLOAD_INFO: {
        NO_FILE: {
            code: 1001,
            msg: '请先选择文件'
        },
        INVALID_TYPE: {
            code: 1002,
            msg: 'The type is not allowed for uploading'
        },
        NO_FILE_EXISTS: {
            code: 1003,
            msg: 'No file exists'
        },
        APPENDED: {
            code: 0,
            msg: 'Appended'
        },
        CREATED: {
            code: 0,
            msg: 'File is Created'
        },
    },
    ALLOWED_TYPE: {
        'video/mp4': 'mp4',
        'video/ogg': 'ogg',
    }
}