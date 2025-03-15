import request from '@/utils/request'

// 查询学习目标列表
export function listGoal(query) {
  return request({
    url: '/user/goal/list',
    method: 'get',
    params: query
  })
}

// 查询学习目标详细
export function getGoal(id) {
  return request({
    url: '/user/goal/' + id,
    method: 'get'
  })
}

// 新增学习目标
export function addGoal(data) {
  return request({
    url: '/user/goal',
    method: 'post',
    data: data
  })
}

// 修改学习目标
export function updateGoal(data) {
  return request({
    url: '/user/goal',
    method: 'put',
    data: data
  })
}

// 删除学习计目标
export function delGoal(id) {
  return request({
    url: '/user/goal/' + id,
    method: 'delete'
  })
}
