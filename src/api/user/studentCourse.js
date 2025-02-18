import request from '@/utils/request'

// 新增学生选课
export function addStudentCourse(data) {
  return request({
    url: '/user/student_course',
    method: 'post',
    data: data
  })
}

// 查看学生选课列表
export function listStudentCourse(params) {
  return request({
    url: '/user/student_course/list',
    method: 'get',
    params
  })
}