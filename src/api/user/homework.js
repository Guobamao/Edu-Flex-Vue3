import request from '@/utils/request'

// 查询作业列表
export function listHomework(params) {
  return request({
    url: '/user/homework/list',
    method: 'get',
    params
  })
}

// 查询作业详情
export function getHomework(id) {
  return request({
    url: '/user/homework/' + id,
    method: 'get'
  })
}

// 提交作业
export function submitHomework(data) {
  return request({
    url: '/user/homework/submit',
    method: 'put',
    data
  })
}