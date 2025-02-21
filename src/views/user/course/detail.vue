<template>
    <div class="app-container">
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/course' }">全部课程</el-breadcrumb-item>
            <el-breadcrumb-item>{{ courseInfo.name }}</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card class="course-meta">
            <el-row :gutter="20" class="course-info">
                <el-col :span="6">
                    <el-image :src="courseInfo.cover" style="width: 100%; height: 150px;" />
                </el-col>
                <el-col :span="18">
                    <p class="item">
                        <span class="label">课程名称</span>
                        <span class="value">{{ courseInfo.name }}</span>
                    </p>
                    <p class="item">
                        <span class="label">课程时长</span>
                        <span class="value">{{ courseInfo.videoTime }}</span>
                    </p>
                    <p class="item">
                        <span class="label">开始时间</span>
                        <span class="value">{{ courseInfo.startTime }}</span>
                        <span class="label">结束时间</span>
                        <span class="value">{{ courseInfo.endTime }}</span>
                    </p>
                    <p class="item">
                        <span class="label">所属分类</span>
                        <span class="value">{{ courseInfo.categoryName }}</span>
                        <span class="label">已选人数</span>
                        <span class="value">{{ courseInfo.selectedNum }}</span>
                    </p>
                </el-col>
                <dict-tag :options="common_status" :value="courseInfo.status" class="course-status" />
            </el-row>
        </el-card>

        <el-row :gutter="20" class="mt20">
            <el-col :xs="24" :sm="24" :md="14" :lg="16" :xl="18">
                <el-card class="mb20">
                    <el-tabs>
                        <el-tab-pane label="课程介绍">
                            <div v-html="courseInfo.description"></div>
                        </el-tab-pane>
                        <el-tab-pane label="课程目录">
                            <el-table ref="tableRef" :data="chapterList" row-key="id" lazy :load="loadMaterials"
                                :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
                                @row-click="handleRowClick" class="course-table">
                                <el-table-column prop="name" label="章节名称" align="left">
                                    <template #default="scope">
                                        <!-- 判断为章节 -->
                                        <strong v-if="scope.row.parentId === 0 && !scope.row.chapterId">{{
                                            scope.row.name }}</strong>
                                        <!-- 判断为资源 -->
                                        <el-link v-else-if="!scope.row.parentId && scope.row.chapterId"
                                            @click="handleMaterialClick(scope.row)" class="material-icon">
                                            <svg-icon icon-class="document" v-if="scope.row.materialType === 1" />
                                            <svg-icon icon-class="picture" v-if="scope.row.materialType === 2" />
                                            <svg-icon icon-class="video" v-if="scope.row.materialType === 3" />
                                            <svg-icon icon-class="ppt" v-if="scope.row.materialType === 4" />
                                            <svg-icon icon-class="pdf" v-if="scope.row.materialType === 5" />
                                            <svg-icon icon-class="other" v-if="scope.row.materialType === 6" />
                                            {{ scope.row.name }}
                                        </el-link>
                                    </template>
                                </el-table-column>
                                <el-table-column width="100">
                                    <template #default="scope">
                                        <span v-if="scope.row.chapterId && scope.row.materialType === 3">
                                            {{ scope.row.duration ? formatSeconds(scope.row.duration) : '--' }}
                                        </span>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="progress" label="学习进度">
                                    <template #default="scope">
                                        <el-progress :percentage="scope.row.progress" :stroke-width="5" />
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-tab-pane>
                        <el-tab-pane label="课程评论">
                            <div class="comment-list">
                                <template v-if="commentList.length">
                                    <el-row v-for="item in commentList" :key="item.id" justify="center" :gutter="20"
                                        class="comment-item">
                                        <el-col :span="2" class="text-center">
                                            <el-avatar :src="item.avatar" />
                                        </el-col>
                                        <el-col :span="22">
                                            <div class="comment-header">
                                                <span class="comment-name">{{ item.nickName }}</span>
                                            </div>
                                            <div class="comment-body" v-html="item.content"></div>
                                            <div class="comment-footer">
                                                <span class="comment-time">{{ item.createTime }}</span>
                                                <el-link v-if="isLogin" @click="handleReply(item.id, item.nickName)"
                                                    class="comment-reply">回复</el-link>
                                            </div>
                                            <div v-if="isLogin && replyTo.id === item.id">
                                                <div class="reply-to">
                                                    回复 {{ replyTo.nickName }}
                                                    <el-link @click="cancelReply"
                                                        style="margin-left: 10px;">取消回复</el-link>
                                                </div>
                                                <editor v-model="comment" :min-height="192" placeholder="请输入评论内容" />
                                                <el-button type="primary" class="btn-submit" :disabled="isCommentEmpty"
                                                    @click="handleComment">发表评论</el-button>
                                            </div>
                                            <div v-if="item.children && item.children.length" class="comment-children">
                                                <el-row v-for="child in item.children" :key="child.id" justify="center"
                                                    :gutter="20" class="comment-item">
                                                    <el-col :span="2" class="text-center">
                                                        <el-avatar :src="child.avatar" />
                                                    </el-col>
                                                    <el-col :span="22">
                                                        <div class="comment-header">
                                                            <span class="comment-name">{{ child.nickName }}</span>
                                                        </div>
                                                        <div class="comment-body" v-html="child.content"></div>
                                                        <div class="comment-footer">
                                                            <span class="comment-time">{{ child.createTime }}</span>
                                                        </div>
                                                    </el-col>
                                                </el-row>
                                            </div>
                                        </el-col>
                                    </el-row>
                                </template>
                                <template v-else>
                                    <el-empty description="暂无评论，快来发表评论吧！" />
                                </template>
                                <pagination v-show="total > 0" :total="total" v-model:page="pageParams.pageNum"
                                    v-model:limit="pageParams.pageSize" layout="total, prev, pager, next, jumper"
                                    @pagination="getCommentList" />
                                <div v-if="isLogin && !replyTo.id">
                                    <editor v-model="comment" :min-height="192" placeholder="请输入评论内容" />
                                    <el-button type="primary" class="btn-submit" :disabled="isCommentEmpty"
                                        @click="handleComment">发表评论</el-button>
                                </div>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="24" :md="10" :lg="8" :xl="6">
                <!-- 选课 -->
                <el-row class="mb20">
                    <el-col>
                        <el-card>
                            <el-button type="success" class="action-button" v-if="!isLogin"
                                @click="router.push('/login')">用户登录</el-button>
                            <el-button type="primary" class="action-button"
                                v-else-if="isLogin && !courseInfo.isSelected"
                                @click="handleSelectCourse">加入选课</el-button>
                            <el-button type="danger" class="action-button" v-else-if="isLogin && courseInfo.isSelected"
                                @click="handleSelectCourse">取消选课</el-button>
                        </el-card>
                    </el-col>
                </el-row>
                <el-row class="mb20">
                    <el-col>
                        <el-card>
                            <span style="font-size: 14px;">授课老师</span>
                            <el-row justify="center" align="middle" :gutter="10" class="mt10">
                                <el-col :span="4" class="text-center">
                                    <el-avatar :src="teacherInfo.avatar" />
                                </el-col>
                                <el-col :span="20">
                                    <span class="teacher-name">{{ teacherInfo.nickName }}</span>
                                </el-col>
                            </el-row>
                        </el-card>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col>
                        <el-card class="related-course">
                            <span style="font-size: 14px;">相关课程</span>
                            <div v-for="item in relatedCourseList" :key="item.id" class="related-course-item">
                                <el-row :gutter="10" align="middle">
                                    <el-col :span="8">
                                        <el-image :src="item.cover" fit="cover" style="width: 100%; height: 60px;">
                                        </el-image>
                                    </el-col>
                                    <el-col :span="16" style="line-height: 25px;">
                                        <div class="title">
                                            <el-link :underline="false" @click="handleRouterPush(item.id)">{{ item.name
                                            }}</el-link>
                                        </div>
                                        <div class="meta">
                                            <span class="teacherName">讲师: {{ item.teacherName }}</span>
                                            <span class="videoNum">{{ item.videoNum }} 节课</span>
                                            <span class="selectedNum">{{ item.selectedNum }} 人已选</span>
                                        </div>
                                    </el-col>
                                </el-row>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </el-col>
        </el-row>
    </div>
</template>
<script setup name="UserCourseDetail">
import { getCourse, listRelatedCourse } from "@/api/user/course"
import { listChapter } from "@/api/user/chapter"
import { listMaterial } from "@/api/user/material"
import { listComment, addComment } from "@/api/user/comment"
import { addStudentCourse } from "@/api/user/studentCourse"
import { getTeacher } from "@/api/user/teacher"
import { formatSeconds } from '@/utils/index';
import { getToken } from "@/utils/auth"

const { proxy } = getCurrentInstance();
const { common_status } = proxy.useDict('common_status')
const route = useRoute();
const router = useRouter();

const courseInfo = ref({})
const teacherInfo = ref({})
const chapterList = ref([]);
const commentList = ref([]);

const relatedCourseList = ref([]);

const pageParams = ref({
    pageNum: 1,
    pageSize: 10,
})
const total = ref(0);

const comment = ref('');
const replyTo = ref({});

const tableRef = ref(null);

const isLogin = computed(() => getToken())
const isCommentEmpty = computed(() => {
    return !comment.value.trim() || !comment.value.replace(/<[^>]*>?/gm, '').trim();
})

function getData() {
    getCourse(route.params.courseId).then(res => {
        courseInfo.value = res.data
        courseInfo.value.cover = proxy.$previewUrl + courseInfo.value.cover
        courseInfo.value.videoTime = courseInfo.value.videoTime ? formatSeconds(courseInfo.value.videoTime) : '--'
        document.title = `${courseInfo.value.name} -     学智灵云课堂`;
    }).then(() => {
        getTeacher(courseInfo.value.teacherId).then(res => {
            res.data.avatar = proxy.$previewUrl + res.data.avatar
            teacherInfo.value = res.data
        })
    }).then(() => {
        listRelatedCourse(courseInfo.value.id).then(res => {
            relatedCourseList.value = res.data
            relatedCourseList.value.forEach(item => {
                item.cover = proxy.$previewUrl + item.cover
            })
        })
    })
    listChapter({ courseId: route.params.courseId }).then(res => {
        chapterList.value = res.data
    })
    getCommentList();
}

// 存储懒加载的数据
const maps = new Map();
function loadMaterials(row, treeNode, resolve) {
    const _chapterId = row.id;

    // 懒加载时，将数据存储到maps中
    maps.set(_chapterId, { row, treeNode, resolve });

    listMaterial({ chapterId: _chapterId }).then(res => {
        if (res.data.length > 0) {
            resolve(res.data)
        } else {
            tableRef.value.store.states.lazyTreeNodeMap.value[_chapterId] = []
        }
    })
}

// 树形列表点击事件 
function handleRowClick(row, column, event) {
    row.expanded = !row.expanded;
    if (row.hasChildren) {
        const expandBtn = event.currentTarget.querySelector('.el-table__expand-icon')
        if (expandBtn) {
            expandBtn.click()
        }
    } else {
        tableRef.value.toggleRowExpansion(row, row.expanded)
    }
}

// 选课/退选
function handleSelectCourse() {
    if (courseInfo.value.isSelected) {
        proxy.$modal.confirm('确定退选该课程吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            // 退选
            addStudentCourse({ courseId: courseInfo.value.id, isSelected: false }).then(() => {
                proxy.$message.success('退选成功')
                courseInfo.value.isSelected = false
            })
        }).catch(() => { });
    } else {
        // 选课
        if (!isLogin.value) {
            proxy.$modal.confirm('您还未登录，是否前往登录？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                const redirect = '/login?redirect=' + route.fullPath
                router.push(redirect)
            }).catch(() => { });
            return
        }
        if (courseInfo.value.status === 0) {
            proxy.$message.error('该课程未开始，无法选课')
            return
        }
        if (courseInfo.value.status === 2) {
            proxy.$message.error('该课程已结束，无法选课')
            return
        }
        addStudentCourse({ courseId: courseInfo.value.id, isSelected: true }).then(() => {
            proxy.$message.success('选课成功')
            courseInfo.value.isSelected = true
        })
    }
}

// 路由跳转
function handleRouterPush(id) {
    router.push({ name: 'UserCourseDetail', params: { courseId: id } })
}

// 点击资源
function handleMaterialClick(row) {
    if (!isLogin.value) {
        proxy.$modal.confirm('您还未登录，是否前往登录？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            const redirect = '/login?redirect=' + route.fullPath
            router.push(redirect)
        }).catch(() => { });
    } else {
        if (!courseInfo.value.isSelected) {
            proxy.$modal.confirm('您还未选择该课程，是否加入选课？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                handleSelectCourse()
            }).catch(() => { });
        } else {
            // TODO：查看资料
        }
    }
}

// 获取评论列表
function getCommentList() {
    listComment({ ...pageParams.value, courseId: route.params.courseId }).then(res => {
        res.rows.forEach(item => {
            item.avatar = proxy.$previewUrl + item.avatar
        })
        commentList.value = proxy.handleTree(res.rows, 'id', 'parentId')
        total.value = res.total;
    })
}

// 发送评论
function handleComment() {
    if (!isLogin) {
        proxy.$message.error('请先登录')
        return
    }
    if (!isCommentEmpty) {
        proxy.$message.error('评论内容不能为空')
        return
    }

    const data = {
        courseId: route.params.courseId,
        content: comment.value,
        parentId: replyTo.value.id || null
    }
    addComment(data).then(() => {
        proxy.$message.success('评论成功')
        comment.value = ''
        replyTo.value = {}
        getCommentList()
    })
}

// 回复评论
function handleReply(id, nickName) {
    console.log(id, nickName)
    replyTo.value = { id, nickName }
}
// 取消回复
function cancelReply() {
    replyTo.value = {}
}
getData()
</script>

<style lang="scss" scoped>
.course-meta {
    margin-top: 20px;

    .course-info {
        align-items: center;

        .label {
            margin-right: 5px;
        }

        .value {
            margin-left: 5px;
            margin-right: 15px;
            color: #666;
        }

        .course-status {
            position: absolute;
            right: 0;
            top: 0;
        }
    }
}

.comment-list {
    .comment-item {
        border-bottom: 1px solid #eee;
        margin-bottom: 5px;
        padding-bottom: 5px;
        margin-top: 5px;
        padding-top: 5px;
    }

    .comment-header {
        .comment-name {
            font-size: 14px;
        }
    }

    .comment-body {
        color: #666;
        font-size: 15px;

        * {
            margin: 5px 0;
        }
    }

    .comment-footer {
        display: flex;
        align-items: baseline;

        .comment-time {
            font-size: 13px;
            color: #999;
        }

        .comment-reply {
            font-size: 13px;
            margin-left: 10px;
        }
    }

    .reply-to {
        display: flex;
        align-items: baseline;
        font-size: 13px;
        margin-top: 5px;
    }

    .comment-children {
        .comment-item {
            border-bottom: none;
        }
    }


    .pagination-container {
        margin-bottom: 30px;
    }

    .btn-submit {
        margin-top: 10px;
        float: right;
    }
}

.course-table {
    .material-icon {
        .svg-icon {
            width: 1.5em;
            height: 1.5em;
            margin-right: 5px;
        }
    }
}

.action-button {
    width: 100%;
    height: 40px;
}

.teacher-name {
    font-size: 14px;
}

.related-course {
    .related-course-item {
        margin-top: 10px;
        margin-bottom: 10px;
        border-bottom: 1px solid #eee;
    }

    .course-name {
        font-size: 14px;
    }

    .title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .meta {
        font-size: 13px;

        .videoNum {
            margin-left: 10px;
        }

        .selectedNum {
            margin-left: 10px;
        }
    }
}
</style>