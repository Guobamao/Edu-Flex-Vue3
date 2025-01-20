import request from '@/utils/request'

// 查询试卷管理列表
export function listPaper(query) {
  return request({
    url: '/manage/paper/list',
    method: 'get',
    params: query
  })
}

// 查询试卷管理详细
export function getPaper(id) {
  return request({
    url: '/manage/paper/' + id,
    method: 'get'
  })
}

// 新增试卷管理
export function addPaper(data) {
  return request({
    url: '/manage/paper',
    method: 'post',
    data: data
  })
}

// 修改试卷管理
export function updatePaper(data) {
  return request({
    url: '/manage/paper',
    method: 'put',
    data: data
  })
}

// 删除试卷管理
export function delPaper(id) {
  return request({
    url: '/manage/paper/' + id,
    method: 'delete'
  })
}

// 组卷——添加题目
export function addPaperQuestion(data) {
  return request({
    url: '/manage/paper/question',
    method: 'post',
    data: data
  })
}

// 获取试卷题目列表
export function getPaperQuestions(id) {
  return request({
    url: '/manage/paper/question/' + id,
    method: 'get'
  })
}
