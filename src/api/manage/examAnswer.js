import request from '@/utils/request'

// 查询考试答案记录列表
export function listExamAnswer(query) {
  return request({
    url: '/manage/exam/answer/list',
    method: 'get',
    params: query
  })
}

// 查询考试答案记录详细
export function getExamAnswer(id) {
  return request({
    url: '/manage/exam/answer/' + id,
    method: 'get'
  })
}

// 新增考试答案记录
export function addExamAnswer(data) {
  return request({
    url: '/manage/exam/answer',
    method: 'post',
    data: data
  })
}

// 修改考试答案记录
export function updateExamAnswer(data) {
  return request({
    url: '/manage/exam/answer',
    method: 'put',
    data: data
  })
}

// 删除考试答案记录
export function delExamAnswer(id) {
  return request({
    url: '/manage/exam/answer/' + id,
    method: 'delete'
  })
}
