import request from '@/utils/request'

// 查询学生作业列表
export function listStudentHomework(query) {
  return request({
    url: '/manage/student_homework/list',
    method: 'get',
    params: query
  })
}

// 查询学生作业详细
export function getStudentHomework(id) {
  return request({
    url: '/manage/student_homework/' + id,
    method: 'get'
  })
}

// 修改学生作业
export function checkStudentHomework(data) {
  return request({
    url: '/manage/student_homework/check',
    method: 'put',
    data: data
  })
}