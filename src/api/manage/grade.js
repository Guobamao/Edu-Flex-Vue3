import request from '@/utils/request'

// 查询班级管理列表
export function listGrade(query) {
  return request({
    url: '/manage/grade/list',
    method: 'get',
    params: query
  })
}

// 查询班级管理详细
export function getGrade(id) {
  return request({
    url: '/manage/grade/' + id,
    method: 'get'
  })
}

// 新增班级管理
export function addGrade(data) {
  return request({
    url: '/manage/grade',
    method: 'post',
    data: data
  })
}

// 修改班级管理
export function updateGrade(data) {
  return request({
    url: '/manage/grade',
    method: 'put',
    data: data
  })
}

// 删除班级管理
export function delGrade(id) {
  return request({
    url: '/manage/grade/' + id,
    method: 'delete'
  })
}
