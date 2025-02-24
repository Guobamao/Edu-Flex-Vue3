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
            <el-col :xs="24" :sm="24" :md="24" :lg="16" :xl="18">
                <el-card class="mb20">
                    <el-tabs>
                        <el-tab-pane label="课程介绍">
                            <div v-html="courseInfo.description"></div>
                        </el-tab-pane>
                        <el-tab-pane label="课程目录">
                            <CourseDirectory :courseInfo="courseInfo" />
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
            <el-col :xs="24" :sm="24" :md="24" :lg="8" :xl="6">
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
                                            <el-link :underline="false" @click="handleRouterPush(item.id)">
                                                {{ item.name }}
                                            </el-link>
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
import { addStudentCourse } from "@/api/user/studentCourse"
import { getTeacher } from "@/api/user/teacher"
import { formatSeconds } from '@/utils/index';
import { getToken } from "@/utils/auth"

import CourseDirectory from "./components/CourseDirectory.vue";
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
// 相关课程信息
const relatedCourseList = ref([]);
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
    }).then(() => {
        listRelatedCourse(courseInfo.value.id).then(res => {
            relatedCourseList.value = res.data
            relatedCourseList.value.forEach(item => {
                item.cover = proxy.$previewUrl + item.cover
            })
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