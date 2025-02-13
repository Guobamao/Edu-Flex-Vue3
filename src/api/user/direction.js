import request from '@/utils/request'

// 查询课程方向列表
export function listDirection(query) {
  return request({
    url: '/user/direction/list',
    method: 'get',
    params: query
  })
}
