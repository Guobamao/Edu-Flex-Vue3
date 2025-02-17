import request from '@/utils/request'

// 查询课程方向列表
export function listCourseByDirectionId(directionId, type) {
  return request({
    url: '/user/course/listByDirection',
    method: 'get',
    params: { directionId, type }
  })
}

// 查看课程列表
export function listCourse(params) {
  return request({
    url: '/user/course/list',
    method: 'get',
    params
  })
}

// 查询课程详细
export function getCourse(id) {
  return request({
    url: '/user/course/' + id,
    method: 'get'
  })
}

// 查看相关课程列表
export function listRelatedCourse(id) {
  return request({
    url: '/user/course/listRelatedCourse/' + id,
    method: 'get'
  })
}

// 搜索课程
export function searchCourse(params) {
  return request({
    url: '/user/course/search',
    method: 'get',
    params
  })
}

// 推荐课程列表
export function listRecommendCourse() {
  return request({
    url: '/user/course/listRecommend',
    method: 'get'
  })
}