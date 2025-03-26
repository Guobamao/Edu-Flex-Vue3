import request from '@/utils/request'

// 查询课程内容章节管理列表
export function listChapter(query) {
  return request({
    url: '/manage/chapter/list',
    method: 'get',
    params: query
  })
}

// 查询课程章节列表（排除节点）
export function listChapterExcludeChild(chapterId) {
  return request({
    url: '/manage/chapter/list/exclude/' + chapterId,
    method: 'get'
  })
}

// 查询课程内容章节管理详细
export function getChapter(id) {
  return request({
    url: '/manage/chapter/' + id,
    method: 'get'
  })
}

// 新增课程内容章节管理
export function addChapter(data) {
  return request({
    url: '/manage/chapter',
    method: 'post',
    data: data
  })
}

// 修改课程内容章节管理
export function updateChapter(data) {
  return request({
    url: '/manage/chapter',
    method: 'put',
    data: data
  })
}

// 删除课程内容章节管理
export function delChapter(id) {
  return request({
    url: '/manage/chapter/' + id,
    method: 'delete'
  })
}

// 查询课程内容章节管理列表
export function listChapterWithProgress(query) {
  return request({
    url: '/manage/chapter/list/withProgress',
    method: 'get',
    params: query
  })
}