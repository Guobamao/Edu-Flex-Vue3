import request from '@/utils/request'

// 查询学院管理列表
export function listCollege(query) {
  return request({
    url: '/manage/college/list',
    method: 'get',
    params: query
  })
}

// 查询学院列表（排除节点）
export function listCollegeExcludeChild(collegeId) {
  return request({
    url: '/manage/college/list/exclude/' + collegeId,
    method: 'get'
  })
}

// 查询学院管理详细
export function getCollege(id) {
  return request({
    url: '/manage/college/' + id,
    method: 'get'
  })
}

// 新增学院管理
export function addCollege(data) {
  return request({
    url: '/manage/college',
    method: 'post',
    data: data
  })
}

// 修改学院管理
export function updateCollege(data) {
  return request({
    url: '/manage/college',
    method: 'put',
    data: data
  })
}

// 删除学院管理
export function delCollege(id) {
  return request({
    url: '/manage/college/' + id,
    method: 'delete'
  })
}
