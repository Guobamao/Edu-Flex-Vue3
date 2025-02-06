import request from '@/utils/request'

// 查询学习路线管理列表
export function listRoute(query) {
  return request({
    url: '/manage/route/list',
    method: 'get',
    params: query
  })
}

// 查询学习路线管理详细
export function getRoute(id) {
  return request({
    url: '/manage/route/' + id,
    method: 'get'
  })
}

// 新增学习路线管理
export function addRoute(data) {
  return request({
    url: '/manage/route',
    method: 'post',
    data: data
  })
}

// 修改学习路线管理
export function updateRoute(data) {
  return request({
    url: '/manage/route',
    method: 'put',
    data: data
  })
}

// 删除学习路线管理
export function delRoute(id) {
  return request({
    url: '/manage/route/' + id,
    method: 'delete'
  })
}
