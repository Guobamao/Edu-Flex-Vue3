import request from '@/utils/request'

// 查询课程方向列表
export function listDirection(query) {
  return request({
    url: '/manage/direction/list',
    method: 'get',
    params: query
  })
}

// 查询课程方向详细
export function getDirection(id) {
  return request({
    url: '/manage/direction/' + id,
    method: 'get'
  })
}

// 新增课程方向
export function addDirection(data) {
  return request({
    url: '/manage/direction',
    method: 'post',
    data: data
  })
}

// 修改课程方向
export function updateDirection(data) {
  return request({
    url: '/manage/direction',
    method: 'put',
    data: data
  })
}

// 删除课程方向
export function delDirection(id) {
  return request({
    url: '/manage/direction/' + id,
    method: 'delete'
  })
}
