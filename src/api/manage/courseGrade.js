import request from '@/utils/request'

// 查询班级课程管理列表
export function listCourseGrade(query) {
  return request({
    url: '/manage/courseGrade/list',
    method: 'get',
    params: query
  })
}

// 查询班级课程管理详细
export function getCourseGrade(id) {
  return request({
    url: '/manage/courseGrade/' + id,
    method: 'get'
  })
}

// 新增班级课程管理
export function addCourseGrade(data) {
  return request({
    url: '/manage/courseGrade',
    method: 'post',
    data: data
  })
}

// 修改班级课程管理
export function updateCourseGrade(data) {
  return request({
    url: '/manage/courseGrade',
    method: 'put',
    data: data
  })
}

// 删除班级课程管理
export function delCourseGrade(id) {
  return request({
    url: '/manage/courseGrade/' + id,
    method: 'delete'
  })
}
