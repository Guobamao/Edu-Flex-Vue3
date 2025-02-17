import request from '@/utils/request'

// 查询课程评论列表
export function listComment(params) {
  return request({
    url: '/user/comment/list',
    method: 'get',
    params
  })
}