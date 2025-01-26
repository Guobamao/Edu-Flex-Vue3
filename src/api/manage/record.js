import request from '@/utils/request'

// 查询学习记录管理列表
export function listRecord(query) {
  return request({
    url: '/manage/record/list',
    method: 'get',
    params: query
  })
}

// 查询学习记录管理详细
export function getRecord(id) {
  return request({
    url: '/manage/record/' + id,
    method: 'get'
  })
}

// 新增学习记录管理
export function addRecord(data) {
  return request({
    url: '/manage/record',
    method: 'post',
    data: data
  })
}

// 修改学习记录管理
export function updateRecord(data) {
  return request({
    url: '/manage/record',
    method: 'put',
    data: data
  })
}

// 删除学习记录管理
export function delRecord(id) {
  return request({
    url: '/manage/record/' + id,
    method: 'delete'
  })
}
