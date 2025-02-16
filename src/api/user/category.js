import request from '@/utils/request'

// 查询课程方向列表
export function listCategory(directionId) {
  return request({
    url: '/user/category/listByDirection',
    method: 'get',
    params: { directionId }
  })
}
