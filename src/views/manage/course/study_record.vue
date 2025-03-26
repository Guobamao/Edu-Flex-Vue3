<template>
    <div class="app-container">
        <!-- <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" icon="Download" @click="handleExport"
                    v-hasRole="['admin', 'teacher']">导出</el-button>
            </el-col>
        </el-row> -->
        <el-table ref="tableRef" :data="chapterList" row-key="id" lazy :load="loadMaterials"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" @row-click="handleRowClick"
            class="course-table">
            <el-table-column prop="chapterName" label="章节名称" align="left" show-overflow-tooltip
                class-name="chapter-name">
                <template #default="scope">
                    <!-- 判断为章节 -->
                    <strong v-if="!scope.row.chapterId">
                        第{{ scope.row.sort }}章
                        {{ scope.row.chapterName }}
                    </strong>
                    <!-- 判断为资源 -->
                    <span v-else class="material-icon">
                        <svg-icon icon-class="document" v-if="scope.row.materialType === 1" />
                        <svg-icon icon-class="picture" v-if="scope.row.materialType === 2" />
                        <svg-icon icon-class="video" v-if="scope.row.materialType === 3" />
                        <svg-icon icon-class="ppt" v-if="scope.row.materialType === 4" />
                        <svg-icon icon-class="pdf" v-if="scope.row.materialType === 5" />
                        <svg-icon icon-class="other" v-if="scope.row.materialType === 6" />
                        {{ scope.row.name }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column width="200" prop="progress" label="学习进度">
                <template #default="scope">
                    <el-progress :percentage="scope.row.progress" :stroke-width="5" />
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>
<script setup name="CourseChapterRecord">
import { listChapterWithProgress } from "@/api/manage/chapter";
import { listMaterialWithProgress } from "@/api/manage/material";

const { proxy } = getCurrentInstance();

const route = useRoute();
const router = useRouter();

// 课程章节信息
const chapterList = ref([]);

const tableRef = ref(null);

function getData() {
    listChapterWithProgress({ recordId: route.params.recordId }).then(res => {
        chapterList.value = res.data;
    })
}

// 存储懒加载的数据
const maps = new Map();
function loadMaterials(row, treeNode, resolve) {
    const _chapterId = row.id;

    // 懒加载时，将数据存储到maps中
    maps.set(_chapterId, { row, treeNode, resolve });

    listMaterialWithProgress({ chapterId: _chapterId, recordId: route.params.recordId }).then(res => {
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

getData();
</script>
<style lang="scss" scoped>
.course-table {
    .material-icon {
        .svg-icon {
            width: 1.5em;
            height: 1.5em;
            margin-right: 5px;
        }
    }
}

:deep(.chapter-name) {
    .cell {
        display: flex;
        align-items: center;
    }
}
</style>