import request from '@/utils/request'

// 新增学生选课
export function getTeacher(id) {
  return request({
    url: '/user/teacher/' + id,
    method: 'get',
  })
}