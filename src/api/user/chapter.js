import request from '@/utils/request'

// 查询课程内容章节列表
export function listChapter(query) {
  return request({
    url: '/user/chapter/list',
    method: 'get',
    params: query
  })
}