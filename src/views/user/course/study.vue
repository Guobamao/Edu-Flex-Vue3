<template>
    <div class="app-container">
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/course' }">全部课程</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/course/' + materialData.courseId }">
                {{ materialData.courseName }}
            </el-breadcrumb-item>
            <el-breadcrumb-item>{{ materialData.chapterName }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ materialData.name }}</el-breadcrumb-item>
        </el-breadcrumb>

        <el-row :gutter="20" justify="space-between" class="container">
            <el-col :span="18">
                <template
                    v-if="materialData.materialType === 1 || materialData.materialType === 4 || materialData.materialType === 5">
                    <el-carousel :autoplay="false" height="68vh" :loop="false" trigger="click" class="carousel-wrapper"
                        @change="handleChange">
                        <el-carousel-item v-for="(item, index) in materialData.fileUrlList" :key="index">
                            <div style="width: 100%; height: 100%; overflow-y: auto;">
                                <el-image :src="item" style="width: 100%;" fit="cover" @click="handlePreview(item)" />
                            </div>
                        </el-carousel-item>
                    </el-carousel>
                </template>
                <template v-else-if="materialData.materialType === 2">
                    <el-image :src="materialData.fileUrl" style="width: 100%;" fit="contain"
                        @click="handlePreview(materialData.fileUrl)" />
                </template>
            </el-col>
            <el-col :span="6">
                <el-card class="material-card">
                    课程目录
                    <el-table ref="tableRef" :data="chapterList" row-key="id" @row-click="handleRowClick"
                        class="course-table" :show-header="false" default-expand-all>
                        <el-table-column prop="name" align="left">
                            <template #default="scope">
                                <!-- 判断为章节 -->
                                <strong v-if="scope.row.parentId === 0 && !scope.row.chapterId">{{
                                    scope.row.name }}</strong>
                                <!-- 判断为资源 -->
                                <el-link v-else-if="!scope.row.parentId && scope.row.chapterId"
                                    :type="linkClass(scope.row)" @click="handleMaterialClick(scope.row)"
                                    class="material-icon">
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
                    </el-table>
                </el-card>
            </el-col>
        </el-row>

        <!-- 图片预览 -->
        <div>
            <el-image-viewer hide-on-click-modal @close="() => { showViewer = false }" v-if="showViewer"
                :url-list="previewList" />
        </div>
    </div>
</template>
<script setup name="UserCourseStudy">
import { getMaterial } from '@/api/user/material';
import { previewFile } from "@/api/manage/file";
import { saveRecord } from '@/api/user/studyRecord';
import { listChapter } from "@/api/user/chapter";
import { listMaterial } from "@/api/user/material";

const { proxy } = getCurrentInstance()

const route = useRoute()
const router = useRouter()

const materialInfo = ref(proxy.$cache.session.getJSON('study'))
const materialData = ref({})

// 允许上传标识
const flag = ref(true)
// 本次学习时长
const duration = ref(0)
const intervalTimer = ref(null)
const timeoutTimer = ref(null)

const showViewer = ref(false);
const previewList = ref([])

const chapterList = ref([]);

const tableRef = ref(null);

// 获取数据
function getData() {
    getMaterial(route.params.materialId).then(res => {
        materialData.value = res.data
        if (materialData.value.materialType === 1 || materialData.value.materialType === 4 || materialData.value.materialType === 5) {
            // 纯文本 / 幻灯片 / PDF，以图片方式预览
            previewFile(materialData.value.fileId).then(res => {
                const ids = res.data.map(item => item.id)
                materialData.value.fileUrlList = ids.map(id => proxy.$previewFileUrl + id)
            })
        } else if (materialData.value.materialType === 2) {
            // 图片类型
            materialData.value.fileUrl = proxy.$previewUrl + materialData.value.fileId
        }
        document.title = '章节 - ' + materialData.value.courseName
    })
    listChapter({ courseId: materialInfo.value.courseId }).then(res => {
        chapterList.value = res.data

        // 提取章节ID
        const chapterIds = chapterList.value.flatMap(item => item.children.map(child => child.id))
        // 批量调用 listMaterial
        Promise.all(chapterIds.map(id => listMaterial({ chapterId: id })))
            .then(res2 => {
                res2.forEach((res3, index) => {
                    const chapterId = chapterIds[index]
                    // 更新到chapterList
                    chapterList.value.forEach(item => {
                        item.hasChildren = false
                        item.children.forEach(child => {
                            child.hasChildren = false
                            if (child.id === chapterId) {
                                child.children = res3.data
                            }
                        })
                    })
                })
            })
    })
}

// 切换图片
function handleChange(current, prev) {
    if (materialData.value.progress !== 100) {
        if (flag.value) {
            const data = {
                courseId: materialInfo.value.courseId,
                chapterId: materialInfo.value.chapterId,
                materialId: materialInfo.value.materialId,
                picIndex: prev, // 当前图片序号
                duration: duration.value,
            }
            saveRecord(data).then(res => {
                if (current === materialData.value.fileUrlList.length - 1 && prev !== current) {
                    timeoutTimer.value = setTimeout(() => {
                        const finalData = {
                            courseId: materialInfo.value.courseId,
                            chapterId: materialInfo.value.chapterId,
                            materialId: materialInfo.value.materialId,
                            picIndex: current, // 最后一张图片序号
                            duration: duration.value,
                        }
                        saveRecord(finalData).then(res => {
                            if (res.msg === "当前资料已学习完成") {
                                proxy.$modal.msgSuccess(res.msg);
                                clearInterval(intervalTimer.value)
                            }
                        })
                    }, 5000)
                } else {
                    // 计时设置标识
                    flag.value = false
                    setTimeout(() => {
                        flag.value = true
                    }, 5000)
                }
                if (res.msg === "当前资料已学习完成") {
                    proxy.$modal.msgSuccess(res.msg);
                    clearInterval(intervalTimer.value)
                }
            })
        }
    }
}

// 如果轮播图只有一张图片，手动触发 handleChange
watch(() => materialData.value.fileUrlList, (newVal) => {
    if (newVal.length === 1) {
        if (materialData.value.progress !== 100) {
            setTimeout(() => {
                handleChange(0, 0);
            }, 5000)
        }
    }
})

// 图片类型
watch(() => materialData.value.fileUrl, (newVal) => {
    setTimeout(() => {
        const data = {
            courseId: materialInfo.value.courseId,
            chapterId: materialInfo.value.chapterId,
            materialId: materialInfo.value.materialId,
            duration: duration.value,
        }
        saveRecord(data).then(res => {
            if (res.msg === "当前资料已学习完成") {
                proxy.$modal.msgSuccess(res.msg);
                clearInterval(intervalTimer.value)
            }
        })
    }, 5000)
})

// 计时器
function countdown() {
    if (materialData.value.progress !== 100) {
        intervalTimer.value = setInterval(() => {
            if (duration.value === 0) {
                duration.value = 1
            }
            duration.value++
        }, 1000)
    }
}

// 预览图片
function handlePreview(url) {
    previewList.value = [url]
    showViewer.value = true
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

// 链接颜色
function linkClass(row) {
    if (row.id === route.params.materialId) {
        return 'warning'
    }
    if (row.progress === 100) {
        return 'success'
    }
}

// 点击资源
function handleMaterialClick(row) {
    clearInterval(intervalTimer.value)
    clearTimeout(timeoutTimer.value)
    const params = {
        courseId: materialInfo.value.courseId,
        chapterId: row.chapterId,
        materialId: row.id
    }
    proxy.$cache.session.setJSON('study', params)
    router.push({ name: 'UserCourseStudy', params: { materialId: row.id } })
}

onUnmounted(() => {
    clearInterval(intervalTimer.value)
    clearTimeout(timeoutTimer.value)
})


getData()
countdown()

</script>
<style lang="scss" scoped>
.app-container {
    .container {
        margin-top: 20px;

        .material-card {
            :deep(.el-card__body) {
                height: 68vh;
                overflow-y: auto
            }
        }

        .course-table {
            margin-top: 20px;
        }
    }

    .carousel-wrapper {
        :deep(.el-carousel__button) {
            background-color: #000000;
        }
    }
}
</style>