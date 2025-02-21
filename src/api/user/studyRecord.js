import request from '@/utils/request'

export function saveRecord(data) {
    return request({
        url: '/user/record/save',
        method: 'post',
        data: data
    })
}