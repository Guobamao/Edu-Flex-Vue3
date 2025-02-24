import request from '@/utils/request'

// 查询考试记录列表
export function listRecord(query) {
  return request({
    url: '/manage/exam/record/list',
    method: 'get',
    params: query
  })
}

// 查询考试记录详细
export function getRecord(id) {
  return request({
    url: '/manage/exam/record/' + id,
    method: 'get'
  })
}

// 新增考试记录
export function addRecord(data) {
  return request({
    url: '/manage/exam/record',
    method: 'post',
    data: data
  })
}

// 修改考试记录
export function updateRecord(data) {
  return request({
    url: '/manage/exam/record',
    method: 'put',
    data: data
  })
}

// 删除考试记录
export function delRecord(id) {
  return request({
    url: '/manage/exam/record/' + id,
    method: 'delete'
  })
}

// 批阅
export function pending(data) {
  return request({
    url: '/manage/exam/record/pending',
    method: 'put',
    data: data
  })
}