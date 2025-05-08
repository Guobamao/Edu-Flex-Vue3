import request from '@/utils/request'

// 查询轮播图列表
export function listCarousel() {
  return request({
    url: '/user/carousel/list',
    method: 'get',
  })
}