import request from '@/utils/request'

// 查询用户个人信息
export function getUserProfile() {
    return request({
      url: '/user/student/profile',
      method: 'get'
    })
}