import request from '@/utils/request'

// 查询作业管理列表
export function listHomework(query) {
  return request({
    url: '/manage/homework/list',
    method: 'get',
    params: query
  })
}

// 查询作业管理详细
export function getHomework(id) {
  return request({
    url: '/manage/homework/' + id,
    method: 'get'
  })
}

// 新增作业管理
export function addHomework(data) {
  return request({
    url: '/manage/homework',
    method: 'post',
    data: data
  })
}

// 修改作业管理
export function updateHomework(data) {
  return request({
    url: '/manage/homework',
    method: 'put',
    data: data
  })
}

// 删除作业管理
export function delHomework(id) {
  return request({
    url: '/manage/homework/' + id,
    method: 'delete'
  })
}
