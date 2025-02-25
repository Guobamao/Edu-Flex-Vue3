<template>
    <div class="app-container">
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/course' }">全部课程</el-breadcrumb-item>
            <el-breadcrumb-item>{{ courseInfo.name }}</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card class="course-meta-card">
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-image :src="courseInfo.cover" style="width: 100%; height: 300px;" />
                </el-col>
                <el-col :span="12" class="course-info">
                    <dict-tag :options="common_status" :value="courseInfo.status" class="course-status" />
                    <div class="course-name">
                        {{ courseInfo.name }}
                    </div>
                    <div class="teacher-info">
                        <el-avatar :src="teacherInfo.avatar">
                            {{ teacherInfo.nickName }}
                        </el-avatar>
                        <span class="teacher-name">
                            <el-link :underline="false" @click="gotoTeacher(teacherInfo.id)">
                                {{ teacherInfo.nickName }}
                            </el-link>
                        </span>
                    </div>
                    <div class="course-category">
                        所属分类：{{ courseInfo.categoryName }}
                    </div>
                    <div class="course-time">
                        开始时间：{{ courseInfo.startTime }}
                        &nbsp;&nbsp;
                        结束时间：{{ courseInfo.endTime }}
                    </div>
                    <div class="course-description">
                        简介：<div v-html="courseInfo.description"></div>
                    </div>
                    <div class="course-num">
                        <el-icon>
                            <medal />
                        </el-icon>
                        <span>{{ courseInfo.selectedNum }}人已选</span>
                    </div>
                    <div v-if="!isLogin" class="login-btn">
                        <el-button type="success" @click="router.push('/login')">用户登录</el-button>
                    </div>
                    <div v-else class="login-btn">
                        <el-button v-if="!courseInfo.isSelected" type="primary" @click="handleSelectCourse">加入选课</el-button>
                        <el-button v-else type="danger" @click="handleSelectCourse">取消选课</el-button>
                    </div>
                </el-col>
            </el-row>
        </el-card>

        <el-row class="mt20">
            <el-col :span="24">
                <el-card class="mb20">
                    <el-tabs>
                        <el-tab-pane label="课程章节">
                            <CourseChapter :courseInfo="courseInfo" />
                        </el-tab-pane>
                        <el-tab-pane label="课程评价">
                            <CourseEvaluation />
                        </el-tab-pane>
                        <el-tab-pane label="课程评论">
                            <CourseComment />
                        </el-tab-pane>
                        <el-tab-pane v-if="isLogin" label="课程作业">
                            <CourseHomework />
                        </el-tab-pane>
                        <el-tab-pane v-if="isLogin" label="课程考试">
                        </el-tab-pane>
                    </el-tabs>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>
<script setup name="UserCourseDetail">
import { getCourse } from "@/api/user/course"
import { addStudentCourse } from "@/api/user/studentCourse"
import { getTeacher } from "@/api/user/teacher"
import { formatSeconds } from '@/utils/index';
import { getToken } from "@/utils/auth"

import CourseChapter from "./components/CourseChapter.vue";
import CourseEvaluation from "./components/CourseEvaluation.vue";
import CourseComment from "./components/CourseComment.vue";
import CourseHomework from './components/CourseHomework.vue';

const { proxy } = getCurrentInstance();
const { common_status } = proxy.useDict("common_status")
const route = useRoute();
const router = useRouter();

// 课程信息
const courseInfo = ref({})
// 教师信息
const teacherInfo = ref({})
// 是否已登录
const isLogin = computed(() => getToken())

function getData() {
    getCourse(route.params.courseId).then(res => {
        courseInfo.value = res.data
        courseInfo.value.cover = proxy.$previewUrl + courseInfo.value.cover
        courseInfo.value.videoTime = courseInfo.value.videoTime ? formatSeconds(courseInfo.value.videoTime) : '--'
        document.title = `${courseInfo.value.name} - 学智灵云课堂`;
    }).then(() => {
        getTeacher(courseInfo.value.teacherId).then(res => {
            res.data.avatar = proxy.$previewUrl + res.data.avatar
            teacherInfo.value = res.data
        })
    })
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

getData()
</script>

<style lang="scss" scoped>
.course-meta-card {
    margin-top: 20px;

    .course-info {
        .course-status {
            position: absolute;
            top: 0;
            right: 0;
        }

        .course-name {
            font-size: 20px;
        }

        .teacher-info {
            display: flex;
            align-items: center;
            margin-top: 20px;

            .teacher-name {
                margin-left: 10px;
            }
        }

        .course-description {
            margin-top: 20px;
        }

        .course-category {
            margin-top: 20px;
        }

        .course-time {
            margin-top: 20px;
        }

        .course-num {
            position: absolute;
            bottom: 0px;
            color: #67C23A;
        }

        .login-btn {
            position: absolute;
            bottom: 0;
            right: 10px;
        }
    }
}
</style>