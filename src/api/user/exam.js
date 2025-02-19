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