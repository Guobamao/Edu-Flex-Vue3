import request from '@/utils/request'

// 查询课程资料列表
export function listMaterial(query) {
  return request({
    url: '/user/material/list',
    method: 'get',
    params: query
  })
}

// 查看课程资料
export function getMaterial(id) {
  return request({
    url: '/user/material/' + id,
    method: 'get'
  })
}