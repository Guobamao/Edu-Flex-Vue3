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

        <el-row :gutter="20" class="mt20">
            <el-col :xs="24" :sm="24" :md="16" :lg="17" :xl="18">
                <template
                    v-if="materialData.materialType === 1 || materialData.materialType === 4 || materialData.materialType === 5">
                    <el-carousel :autoplay="false" height="60vh" :loop="false" trigger="click" class="carousel-wrapper"
                        @change="handleChange">
                        <el-carousel-item v-for="(item, index) in materialData.fileUrlList" :key="index">
                            <div style="width: 100%; height: 100%; overflow-y: auto;">
                                <el-image :src="item" style="width: 100%;" fit="cover" @click="handlePreview(item)" />
                            </div>
                        </el-carousel-item>
                    </el-carousel>
                </template>
                <template v-else-if="materialData.materialType === 2">
                    <el-image :src="materialData.fileUrl" style="width: 100%; height: 60vh;" fit="contain" />
                </template>
            </el-col>
            <el-col :xs="24" :sm="24" :md="8" :lg="7" :xl="6">
                <el-card>
                    <el-table ref="tableRef" :data="chapterList" row-key="id" lazy :load="loadMaterials"
                        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" @row-click="handleRowClick"
                        class="course-table">
                        <el-table-column prop="name" align="left">
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
const timer = ref(null)

const showViewer = ref(false);
const previewList = ref([])

const chapterList = ref([]);

const tableRef = ref(null);

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
                    setTimeout(() => {
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
                                clearInterval(timer.value)
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
                    clearInterval(timer.value)
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

// 计时器
function countdown() {
    if (materialData.value.progress !== 100) {
        timer.value = setInterval(() => {
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
    console.log(row)
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



getData()
countdown()

</script>
<style lang="scss" scoped>
.carousel-wrapper {
    :deep(.el-carousel__button) {
        background-color: #000000;
    }
}
</style>