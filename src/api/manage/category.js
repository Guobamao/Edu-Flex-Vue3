import request from '@/utils/request'

// 查询课程分类列表
export function listCategory(query) {
  return request({
    url: '/manage/category/list',
    method: 'get',
    params: query
  })
}

// 查询课程分类列表(排除节点)
export function listCategoryExcludeChild(categoryId) {
  return request({
    url: '/manage/category/list/exclude/' + categoryId,
    method: 'get'
  })
}

// 查询课程分类详细
export function getCategory(id) {
  return request({
    url: '/manage/category/' + id,
    method: 'get'
  })
}

// 新增课程分类
export function addCategory(data) {
  return request({
    url: '/manage/category',
    method: 'post',
    data: data
  })
}

// 修改课程分类
export function updateCategory(data) {
  return request({
    url: '/manage/category',
    method: 'put',
    data: data
  })
}

// 删除课程分类
export function delCategory(id) {
  return request({
    url: '/manage/category/' + id,
    method: 'delete'
  })
}
