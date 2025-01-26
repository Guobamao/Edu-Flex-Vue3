import request from '@/utils/request'

// 查询学生选课列表
export function listStudentCourse(query) {
  return request({
    url: '/manage/student_course/list',
    method: 'get',
    params: query
  })
}

// 查询学生选课详细
export function getStudentCourse(id) {
  return request({
    url: '/manage/student_course/' + id,
    method: 'get'
  })
}

// 新增学生选课
export function addStudentCourse(data) {
  return request({
    url: '/manage/student_course',
    method: 'post',
    data: data
  })
}

// 修改学生选课
export function updateStudentCourse(data) {
  return request({
    url: '/manage/student_course',
    method: 'put',
    data: data
  })
}

// 删除学生选课
export function delStudentCourse(id) {
  return request({
    url: '/manage/student_course/' + id,
    method: 'delete'
  })
}
