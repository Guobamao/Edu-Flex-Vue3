import request from '@/utils/request'

// 查询学习目标管理列表
export function listGoal(query) {
  return request({
    url: '/manage/goal/list',
    method: 'get',
    params: query
  })
}

// 新增学习目标管理
export function addGoal(data) {
  return request({
    url: '/manage/goal',
    method: 'post',
    data: data
  })
}

// 查询学习目标管理详细
export function getGoal(id) {
  return request({
    url: '/manage/goal/' + id,
    method: 'get'
  })
}

// 修改学习目标管理
export function updateGoal(data) {
  return request({
    url: '/manage/goal',
    method: 'put',
    data: data
  })
}

// 删除学习目标管理
export function delGoal(id) {
  return request({
    url: '/manage/goal/' + id,
    method: 'delete'
  })
}
