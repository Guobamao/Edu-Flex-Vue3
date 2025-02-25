<template>
    <el-table ref="tableRef" :data="chapterList" row-key="id" lazy :load="loadMaterials"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" @row-click="handleRowClick"
        class="course-table">
        <el-table-column prop="chapterName" label="章节名称" align="left" show-overflow-tooltip class-name="chapter-name">
            <template #default="scope">
                <!-- 判断为章节 -->
                <strong v-if="!scope.row.chapterId">
                    第{{ scope.row.sort }}章
                    {{ scope.row.chapterName }}
                </strong>
                <!-- 判断为资源 -->
                <el-link v-else @click="handleMaterialClick(scope.row)" class="material-icon">
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
        <el-table-column width="200" prop="progress" label="学习进度" v-if="isLogin && props.courseInfo.isSelected">
            <template #default="scope">
                <el-progress :percentage="scope.row.progress" :stroke-width="5" />
            </template>
        </el-table-column>
    </el-table>
</template>
<script setup name="CourseChapter">
import { listChapter } from "@/api/user/chapter";
import { listMaterial } from "@/api/user/material";
import { getToken } from "@/utils/auth";

const props = defineProps({
    courseInfo: {
        type: Object,
        default: () => {
            return {}
        }
    }
})

const { proxy } = getCurrentInstance();

const route = useRoute();
const router = useRouter();

// 课程章节信息
const chapterList = ref([]);

const tableRef = ref(null);

// 是否已登录
const isLogin = computed(() => getToken())

function getData() {
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
        if (!props.courseInfo.isSelected) {
            proxy.$modal.confirm('您还未选择该课程，是否加入选课？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                handleSelectCourse()
            }).catch(() => { });
        } else {
            const params = {
                courseId: route.params.courseId,
                chapterId: row.chapterId,
                materialId: row.id
            }
            proxy.$cache.session.setJSON('study', params)
            router.push({ name: 'UserCourseStudy', params: { materialId: row.id } })
        }
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