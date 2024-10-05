import request from '@/utils/request'

// 查询学期管理列表
export function listSemester(query) {
  return request({
    url: '/manage/semester/list',
    method: 'get',
    params: query
  })
}

// 查询学期管理详细
export function getSemester(id) {
  return request({
    url: '/manage/semester/' + id,
    method: 'get'
  })
}

// 新增学期管理
export function addSemester(data) {
  return request({
    url: '/manage/semester',
    method: 'post',
    data: data
  })
}

// 修改学期管理
export function updateSemester(data) {
  return request({
    url: '/manage/semester',
    method: 'put',
    data: data
  })
}

// 删除学期管理
export function delSemester(id) {
  return request({
    url: '/manage/semester/' + id,
    method: 'delete'
  })
}
