import request from '@/utils/request'

// 新增学生选课
export function addStudentCourse(data) {
  return request({
    url: '/user/student_course',
    method: 'post',
    data: data
  })
}