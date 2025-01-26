import request from '@/utils/request'

// 查询学习路线记录管理列表
export function listRouteRecord(query) {
  return request({
    url: '/manage/routeRecord/list',
    method: 'get',
    params: query
  })
}

// 查询学习路线记录管理详细
export function getRouteRecord(id) {
  return request({
    url: '/manage/routeRecord/' + id,
    method: 'get'
  })
}

// 新增学习路线记录管理
export function addRouteRecord(data) {
  return request({
    url: '/manage/routeRecord',
    method: 'post',
    data: data
  })
}

// 修改学习路线记录管理
export function updateRouteRecord(data) {
  return request({
    url: '/manage/routeRecord',
    method: 'put',
    data: data
  })
}

// 删除学习路线记录管理
export function delRouteRecord(id) {
  return request({
    url: '/manage/routeRecord/' + id,
    method: 'delete'
  })
}
