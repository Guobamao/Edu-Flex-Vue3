import request from '@/utils/request'

// 查询学习计划管理列表
export function listPlan(query) {
  return request({
    url: '/manage/plan/list',
    method: 'get',
    params: query
  })
}

// 查询学习计划管理详细
export function getPlan(id) {
  return request({
    url: '/manage/plan/' + id,
    method: 'get'
  })
}

// 新增学习计划管理
export function addPlan(data) {
  return request({
    url: '/manage/plan',
    method: 'post',
    data: data
  })
}

// 修改学习计划管理
export function updatePlan(data) {
  return request({
    url: '/manage/plan',
    method: 'put',
    data: data
  })
}

// 删除学习计划管理
export function delPlan(id) {
  return request({
    url: '/manage/plan/' + id,
    method: 'delete'
  })
}
