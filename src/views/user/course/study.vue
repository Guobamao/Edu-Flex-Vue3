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
            <el-col :xs="24" :sm="24" :md="24" :lg="16" :xl="18" class="material-container">
                <template
                    v-if="materialData.materialType === 1 || materialData.materialType === 4 || materialData.materialType === 5">
                    <el-carousel :autoplay="false" height="68vh" :loop="false" indicator-position="none"
                        class="carousel-wrapper" @change="handleChange">
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
                <template v-else-if="materialData.materialType === 3">
                    <div ref="dplayerRef"></div>
                </template>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="8" :xl="6">
                <el-card class="material-card">
                    课程目录
                    <el-table ref="tableRef" :data="chapterList" row-key="id" @row-click="handleRowClick"
                        class="course-table" :show-header="false" default-expand-all>
                        <el-table-column prop="chapterName" label="章节名称" align="left" show-overflow-tooltip
                            class-name="chapter-name">
                            <template #default="scope">
                                <!-- 判断为章节 -->
                                <strong v-if="!scope.row.chapterId">
                                    第{{ scope.row.sort }}章
                                    {{ scope.row.chapterName }}
                                </strong>
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
                        <el-table-column width="70" prop="progress" align="left">
                            <template #default="scope">
                                <el-progress :width="16" :stroke-width="2" type="circle" :percentage="scope.row.progress"
                                    class="progress" />
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
            </el-col>
        </el-row>

        <!-- 图片预览 -->
        <div>
            <el-image-viewer hide-on-click-modal @close="() => { showViewer = false }" v-if="showViewer" show-progress
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
import DPlayer from 'dplayer';

const { proxy } = getCurrentInstance()

const route = useRoute()
const router = useRouter()

const materialInfo = ref(proxy.$cache.session.getJSON('study'))
const materialData = ref({})

// 本次学习时长
const duration = ref(0)
// 计时timer
const intervalTimer = ref(null);
// 保存视频学习记录timer
const saveRecordTimer = ref(null);
const showViewer = ref(false);
const previewList = ref([])

const chapterList = ref([]);

const tableRef = ref(null);
const dp = ref(null);
const dplayerRef = ref(null)

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
        } else if (materialData.value.materialType === 3) {
            nextTick(() => {
                // 音视频类型
                dp.value = new DPlayer({
                    container: dplayerRef.value,
                    autoplay: false,
                    live: false,
                    loop: false,
                    theme: "#b7daff",
                    lang: 'zh-cn',
                    screenshot: false,
                    hotkey: true,
                    video: {
                        type: 'auto',
                        url: proxy.$previewVideo + materialData.value.fileId,
                    }
                })
                if (materialData.value.lastPosition && materialData.value.lastPosition > 0) {
                    dp.value.seek(materialData.value.lastPosition)
                }

                // 点击播放事件
                dp.value.on('play', () => {
                    countdown();
                })

                dp.value.on('playing', () => {
                    saveRecordTimer.value = setInterval(() => {
                        saveVideoRecord();
                    }, 5000)
                })

                // 暂时时触发
                dp.value.on('pause', () => {
                    clearInterval(intervalTimer.value)
                    duration.value = 0;
                    clearInterval(saveRecordTimer.value)
                    saveVideoRecord();
                })

                // 播放结束事件
                dp.value.on('ended', () => {
                    clearInterval(intervalTimer.value)
                    duration.value = 0;
                    clearInterval(saveRecordTimer.value)
                    saveVideoRecord();
                })
            })
        }
        document.title = '章节 - ' + materialData.value.courseName
    })
    listChapter({ courseId: materialInfo.value.courseId }).then(res => {
        chapterList.value = res.data

        // 提取章节ID
        const chapterIds = chapterList.value.map(item => item.id)
        // 批量调用 listMaterial
        Promise.all(chapterIds.map(id => listMaterial({ chapterId: id })))
            .then(res2 => {
                res2.forEach((res3, index) => {
                    // 更新到chapterList
                    chapterList.value.forEach(item => {
                        item.hasChildren = false
                        if (item.id === chapterIds[index]) {
                            item.children = res3.data
                        }
                    })
                })
            })
    })
}

// 切换图片
function handleChange(current, prev) {
    if (materialData.value.progress !== 100) {
        if (current === materialData.value.fileUrlList.length - 1) {
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
                    duration.value = 0;
                }
            })
        } else {
            const data = {
                courseId: materialInfo.value.courseId,
                chapterId: materialInfo.value.chapterId,
                materialId: materialInfo.value.materialId,
                picIndex: prev, // 当前图片序号
                duration: duration.value,
            }
            saveRecord(data).then(res => {
                if (res.msg === "当前资料已学习完成") {
                    proxy.$modal.msgSuccess(res.msg);
                    clearInterval(intervalTimer.value)
                    duration.value = 0;
                }
            })
        }

    }
}

// 如果轮播图只有一张图片，手动触发 handleChange
watch(() => materialData.value.fileUrlList, (newVal) => {
    if (newVal.length === 1) {
        if (materialData.value.progress !== 100) {
            countdown()
            setTimeout(() => {
                handleChange(0, 0);
            }, 1000)
        }
    }
})

// 图片类型
watch(() => materialData.value.fileUrl, (newVal) => {
    setTimeout(() => {
        countdown()
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
                duration.value = 0;
            }
        })
    }, 1000)
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
    const expandBtn = event.currentTarget.querySelector('.el-table__expand-icon')
    if (expandBtn) {
        expandBtn.click()
    }
}

// 保存视频学习进度
function saveVideoRecord() {
    const data = {
        courseId: materialInfo.value.courseId,
        chapterId: materialData.value.chapterId,
        materialId: materialData.value.id,
        duration: duration.value,
        lastPosition: parseInt(dp.value.video.currentTime),
    }
    saveRecord(data).then(res => {
        duration.value = 0;
    })
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
    duration.value = 0;
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
    duration.value = 0;
})


getData()

</script>
<style lang="scss" scoped>
.app-container {
    .container {
        margin-top: 20px;

        .material-container {
            margin-bottom: 20px;
        }

        .material-card {
            :deep(.el-card__body) {
                height: 60vh;
                overflow-y: auto
            }
        }

        .course-table {
            margin-top: 10px;
            .material-icon {
                .svg-icon {
                    width: 1.5em;
                    height: 1.5em;
                    margin-right: 5px;
                }
            }
        }

        .progress {
            :deep(.el-progress__text) {
                font-size: 14px !important; 
                margin-left: 10px;
            }
        }

        :deep(.chapter-name) {
            .cell {
                display: flex;
                align-items: center;
            }
        }

    }

    .carousel-wrapper {
        :deep(.el-carousel__button) {
            background-color: #000000;
        }
    }
}
</style>