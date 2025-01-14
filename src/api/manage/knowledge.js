import request from '@/utils/request'

// 查询知识点分类列表
export function listKnowledge(query) {
  return request({
    url: '/manage/knowledge/list',
    method: 'get',
    params: query
  })
}

// 查询知识点分类详细
export function getKnowledge(id) {
  return request({
    url: '/manage/knowledge/' + id,
    method: 'get'
  })
}

// 新增知识点分类
export function addKnowledge(data) {
  return request({
    url: '/manage/knowledge',
    method: 'post',
    data: data
  })
}

// 修改知识点分类
export function updateKnowledge(data) {
  return request({
    url: '/manage/knowledge',
    method: 'put',
    data: data
  })
}

// 删除知识点分类
export function delKnowledge(id) {
  return request({
    url: '/manage/knowledge/' + id,
    method: 'delete'
  })
}
