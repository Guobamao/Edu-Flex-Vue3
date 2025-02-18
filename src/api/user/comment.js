import request from '@/utils/request'

// 查询课程评论列表
export function listComment(params) {
  return request({
    url: '/user/comment/list',
    method: 'get',
    params
  })
}

// 添加评论
export function addComment(data) {
  return request({
    url: '/user/comment',
    method: 'post',
    data
  })
}