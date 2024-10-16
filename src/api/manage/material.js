import request from '@/utils/request'

// 查询课程资料列表
export function listMaterial(query) {
  return request({
    url: '/manage/material/list',
    method: 'get',
    params: query
  })
}

// 查询课程资料详细
export function getMaterial(id) {
  return request({
    url: '/manage/material/' + id,
    method: 'get'
  })
}

// 新增课程资料
export function addMaterial(data) {
  return request({
    url: '/manage/material',
    method: 'post',
    data: data
  })
}

// 修改课程资料
export function updateMaterial(data) {
  return request({
    url: '/manage/material',
    method: 'put',
    data: data
  })
}

// 删除课程资料
export function delMaterial(id) {
  return request({
    url: '/manage/material/' + id,
    method: 'delete'
  })
}
