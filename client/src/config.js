const BASE_URL = 'http://localhost:8000/'

export const UPLOAD_INFO = {
    NO_FILE: '请先选择文件',
    INVALID_TYPE: '不支持该类型文件上传',
    UPLOAD_FAILED: '上传失败',
    UPLOAD_SUCCESS: '上传成功',
}

export const ALLOWED_TYPE = {
    'video/mp4': 'mp4',
    'video/ogg': 'ogg',
}

export const CHUNK_SIZE = 1024 * 1024;

export const PROMISE_SIZE = 5;

export const API = {
    UPLOAD_VIDEO: BASE_URL + 'upload_video',
    MERGE_VIDEO: BASE_URL + 'merge_video',
    CHECK_CHUNKS: BASE_URL + 'check_chunks',
}

