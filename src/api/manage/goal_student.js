import request from '@/utils/request'

// 查询学习目标-学生关联列表
export function listGoalStudent(query) {
  return request({
    url: '/manage/goalStudent/list',
    method: 'get',
    params: query
  })
}

// 查询学习目标-学生关联详细
export function getGoalStudent(id) {
  return request({
    url: '/manage/goalStudent/' + id,
    method: 'get'
  })
}

// 新增学习目标-学生关联
export function addGoalStudent(data) {
  return request({
    url: '/manage/goalStudent',
    method: 'post',
    data: data
  })
}

// 修改学习目标-学生关联
export function updateGoalStudent(data) {
  return request({
    url: '/manage/goalStudent',
    method: 'put',
    data: data
  })
}

// 删除学习目标-学生关联
export function delGoalStudent(id) {
  return request({
    url: '/manage/goalStudent/' + id,
    method: 'delete'
  })
}