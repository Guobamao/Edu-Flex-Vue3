import request from '@/utils/request'

// 查询课程评价管理列表
export function listEvaluation(query) {
  return request({
    url: '/manage/evaluation/list',
    method: 'get',
    params: query
  })
}

// 查询课程评价管理详细
export function getEvaluation(id) {
  return request({
    url: '/manage/evaluation/' + id,
    method: 'get'
  })
}

// 新增课程评价管理
export function addEvaluation(data) {
  return request({
    url: '/manage/evaluation',
    method: 'post',
    data: data
  })
}

// 修改课程评价管理
export function updateEvaluation(data) {
  return request({
    url: '/manage/evaluation',
    method: 'put',
    data: data
  })
}

// 删除课程评价管理
export function delEvaluation(id) {
  return request({
    url: '/manage/evaluation/' + id,
    method: 'delete'
  })
}
