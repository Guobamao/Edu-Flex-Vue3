import request from '@/utils/request'

// 查询学生考试列表
export function listExam(params) {
  return request({
    url: '/user/exam/list',
    method: 'get',
    params
  })
}
