import request from '@/utils/request'

// 查询作业列表
export function listHomework(params) {
  return request({
    url: '/user/homework/list',
    method: 'get',
    params
  })
}
