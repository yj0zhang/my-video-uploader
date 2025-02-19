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
        CHUNK_LOSE: {
            code: 1003,
            msg: 'File chunk losed'
        },
        APPENDED: {
            code: 0,
            msg: 'Appended'
        },
        MERGED: {
            code: 0,
            msg: 'File is merged'
        },
    },
    ALLOWED_TYPE: {
        'video/mp4': 'mp4',
        'video/ogg': 'ogg',
    }
}