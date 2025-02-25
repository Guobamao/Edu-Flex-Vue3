import request from '@/utils/request'

// 查询课程评价列表
export function listEvaluation(params) {
  return request({
    url: '/user/evaluation/list',
    method: 'get',
    params: params
  })
}

// 新增课程评价
export function addEvaluation(data) {
  return request({
    url: '/user/evaluation',
    method: 'post',
    data: data
  })
}