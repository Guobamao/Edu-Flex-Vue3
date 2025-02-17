<template>
    <div class="app-container">
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/course' }">全部课程</el-breadcrumb-item>
            <el-breadcrumb-item>{{ courseInfo.name }}</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card class="course-meta" shadow="never">
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
                    </p>
                </el-col>
            </el-row>
        </el-card>

        <el-row :gutter="20" class="mt20">
            <el-col :xs="24" :sm="24" :md="14" :lg="16" :xl="18">
                <el-card shadow="never" class="mb20">
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
                                            @click="handleMaterialClick(scope.row)">
                                            <el-icon>
                                                <VideoPlay v-if="scope.row.materialType === 0" />
                                                <Picture v-if="scope.row.materialType === 1" />
                                                <Document v-if="scope.row.materialType === 2" />
                                                <Film v-if="scope.row.materialType === 3" />
                                                <Memo v-if="scope.row.materialType === 4" />
                                            </el-icon>
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
                            </el-table>
                        </el-tab-pane>
                    </el-tabs>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="24" :md="10" :lg="8" :xl="6">
                <!-- 选课 -->
                <el-row class="mb20">
                    <el-col>
                        <el-card shadow="never">
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
                        <el-card shadow="never">
                            <span style="font-size: 14px;">授课老师</span>
                            <el-row justify="center" align="middle" :gutter="20" class="mt10">
                                <el-col :span="5" class="text-center">
                                    <el-avatar :src="teacherInfo.avatar" />
                                </el-col>
                                <el-col :span="19">
                                    <span class="teacher-name">{{ teacherInfo.nickName }}</span>
                                </el-col>
                            </el-row>
                        </el-card>
                    </el-col>
                </el-row>
                <el-row class="related-course">
                    <el-col>
                        <el-card shadow="never">
                            <span style="font-size: 14px;">相关课程</span>
                            <div v-for="item in relatedCourseList" :key="item.id" class="related-course-item">
                                <el-row :gutter="10" align="middle">
                                    <el-col :span="8">
                                        <el-image :src="item.cover" fit="cover" style="width: 100%; height: 50px;">
                                        </el-image>
                                    </el-col>
                                    <el-col :span="16" style="line-height: 25px;">
                                        <el-link :underline="false" @click="handleRouterPush(item.id)">焦点图轮播特效</el-link>
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
import { addStudentCourse } from "@/api/user/studentCourse"
import { getTeacher } from "@/api/user/teacher"
import { formatSeconds } from '@/utils/index';
import { getToken } from "@/utils/auth"

const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();

const courseInfo = ref({})
const teacherInfo = ref({})
const chapterList = ref([]);

const relatedCourseList = ref([]);

const tableRef = ref(null);

const isLogin = computed(() => getToken())

function getData() {
    getCourse(route.params.courseId).then(res => {
        courseInfo.value = res.data
        courseInfo.value.cover = proxy.$previewUrl + courseInfo.value.cover
        courseInfo.value.videoTime = courseInfo.value.videoTime ? formatSeconds(courseInfo.value.videoTime) : '--'
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
            margin-right: 10px;
            color: #666;
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