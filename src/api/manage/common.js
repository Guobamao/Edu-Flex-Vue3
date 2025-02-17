import request from '@/utils/request'

// 上传接口
export function uploadFile(data) {
    return request({
        url: '/common/upload',
        method: 'post',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
    })
}