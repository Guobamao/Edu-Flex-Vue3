import request from '@/utils/request'

// 查询学生考试列表
export function listExam(params) {
  return request({
    url: '/user/exam/list',
    method: 'get',
    params
  })
}

// 查看考试详情
export function getExamInfo(id) {
    return request({
      url: '/user/exam/' + id,
      method: 'get'
    })
}

// 创建考试记录
export function createExamRecord(params) {
  return request({
    url: '/user/exam/create',
    method: 'get',
    params
  })
}

// 查看考试记录详情
export function getExamRecordDetail(id) {
  return request({
    url: '/user/exam/detail/' + id,
    method: 'get'
  })
}

// 提交考试题目答案
export function fillAnswer(data) {
  return request({
    url: '/user/exam/answer/add',
    method: 'post',
    data: data
  })
}

// 交卷
export function submitExam(data) {
  return request({
    url: '/user/exam/submit',
    method: 'post',
    data: data
  })
}

// 获取考试结果
export function getExamResult(id) {
  return request({
    url: '/user/exam/result/' + id,
    method: 'get'
  })
}

// 检查进行中的考试
export function checkExam() {
  return request({
    url: '/user/exam/check',
    method: 'get'
  })
}