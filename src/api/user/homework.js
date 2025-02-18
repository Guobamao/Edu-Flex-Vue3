import request from '@/utils/request'

// 查询课程方向列表
export function listHomework(params) {
  return request({
    url: '/user/homework/list',
    method: 'get',
    params
  })
}
