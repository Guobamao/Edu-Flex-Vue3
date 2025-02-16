import request from '@/utils/request'

// 查询课程资料列表
export function listMaterial(query) {
    return request({
      url: '/user/material/list',
      method: 'get',
      params: query
    })
}