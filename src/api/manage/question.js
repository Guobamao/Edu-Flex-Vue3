import request from '@/utils/request'

// 查询题目管理列表
export function listQuestion(query) {
  return request({
    url: '/manage/question/list',
    method: 'get',
    params: query
  })
}

// 查询题目管理详细
export function getQuestion(id) {
  return request({
    url: '/manage/question/' + id,
    method: 'get'
  })
}

// 新增题目管理
export function addQuestion(data) {
  return request({
    url: '/manage/question',
    method: 'post',
    data: data
  })
}

// 修改题目管理
export function updateQuestion(data) {
  return request({
    url: '/manage/question',
    method: 'put',
    data: data
  })
}

// 删除题目管理
export function delQuestion(id) {
  return request({
    url: '/manage/question/' + id,
    method: 'delete'
  })
}
