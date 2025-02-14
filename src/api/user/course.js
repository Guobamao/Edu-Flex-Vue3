import request from '@/utils/request'

// 查询课程方向列表
export function listCourseByDirectionId(directionId) {
  return request({
    url: '/user/course/listByDirection',
    method: 'get',
    params: { directionId }
  })
}
