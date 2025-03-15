import request from '@/utils/request'

// 查询学习计划列表
export function listPlan(query) {
  return request({
    url: '/user/plan/list',
    method: 'get',
    params: query
  })
}

// 查询学习计划详细
export function getPlan(id) {
  return request({
    url: '/user/plan/' + id,
    method: 'get'
  })
}

// 新增学习计划
export function addPlan(data) {
  return request({
    url: '/user/plan',
    method: 'post',
    data: data
  })
}

// 修改学习计划
export function updatePlan(data) {
  return request({
    url: '/user/plan',
    method: 'put',
    data: data
  })
}

// 删除学习计划
export function delPlan(id) {
  return request({
    url: '/user/plan/' + id,
    method: 'delete'
  })
}
