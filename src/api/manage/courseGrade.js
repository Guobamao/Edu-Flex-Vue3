import request from '@/utils/request'

// 查询课程-班级关系列表
export function listCourseGrade(query) {
  return request({
    url: '/manage/courseGrade/list',
    method: 'get',
    params: query
  })
}

// 查询课程-班级关系详细
export function getCourseGrade(id) {
  return request({
    url: '/manage/courseGrade/' + id,
    method: 'get'
  })
}

// 新增课程-班级关系
export function addCourseGrade(data) {
  return request({
    url: '/manage/courseGrade',
    method: 'post',
    data: data
  })
}

// 修改课程-班级关系
export function updateCourseGrade(data) {
  return request({
    url: '/manage/courseGrade',
    method: 'put',
    data: data
  })
}

// 删除课程-班级关系
export function delCourseGrade(id) {
  return request({
    url: '/manage/courseGrade/' + id,
    method: 'delete'
  })
}
