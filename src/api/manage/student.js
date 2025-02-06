import request from '@/utils/request'

// 查询学生管理列表
export function listStudent(query) {
  return request({
    url: '/manage/student/list',
    method: 'get',
    params: query
  })
}

// 查询学生管理详细
export function getStudent(id) {
  return request({
    url: '/manage/student/' + id,
    method: 'get'
  })
}

// 新增学生管理
export function addStudent(data) {
  return request({
    url: '/manage/student',
    method: 'post',
    data: data
  })
}

// 修改学生管理
export function updateStudent(data) {
  return request({
    url: '/manage/student',
    method: 'put',
    data: data
  })
}

// 删除学生管理
export function delStudent(id) {
  return request({
    url: '/manage/student/' + id,
    method: 'delete'
  })
}

// 重置学生密码
export function resetStudentPwd(data) {
  return request({
    url: '/manage/student/resetPwd',
    method: 'put',
    data: data
  })
}

// 查询学生列表 - 学习目标
export function listStudentForGoal(query) {
  return request({
    url: '/manage/student/goal/list',
    method: 'get',
    params: query
  })
}