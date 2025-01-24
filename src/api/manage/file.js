import request from '@/utils/request'

// 查询资源管理列表
export function listFile(query) {
  return request({
    url: '/manage/files/list',
    method: 'get',
    params: query
  })
}

// 查询资源管理详细
export function getFile(id) {
  return request({
    url: '/manage/files/' + id,
    method: 'get'
  })
}

// 修改资源管理
export function updateFile(data) {
  return request({
    url: '/manage/files',
    method: 'put',
    data: data
  })
}

// 删除资源管理
export function delFile(id) {
  return request({
    url: '/manage/files/' + id,
    method: 'delete'
  })
}

export function previewFile(id) {
  return request({
    url: '/manage/files/preview/' + id,
    method: 'get'
  })
}