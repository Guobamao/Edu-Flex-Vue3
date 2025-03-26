import request from '@/utils/request'

// 获取统计数据
export function getStats() {
  return request({
    url: '/manage/dashboard/stats',
    method: 'get',
  })
}

// 获取热门课程
export function getTopCourses() {
    return request({
        url: '/manage/dashboard/top-courses',
        method: 'get',
    })
}

// 获取最近选课趋势
export function getTrend() {
    return request({
        url: '/manage/dashboard/trend',
        method: 'get',
    })
}