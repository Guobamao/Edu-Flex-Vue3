import request from '@/utils/request'

// 查询热搜关键词
export function listSearch() {
  return request({
    url: '/user/search/list',
    method: 'get',
  })
}