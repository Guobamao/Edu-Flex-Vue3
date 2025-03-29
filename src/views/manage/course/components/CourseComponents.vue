<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="课程名称" prop="name">
                <el-input v-model="queryParams.name" placeholder="请输入课程名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="courseList">
            <el-table-column label="序号" type="index" width="50" align="center" prop="id" />
            <el-table-column label="课程封面" align="center" prop="cover">
                <template #default="scope">
                    <img :src="scope.row.cover" width="40%" height="10%" />
                </template>
            </el-table-column>
            <el-table-column label="课程名称" align="center" prop="name" show-overflow-tooltip />
            <el-table-column label="任课老师" align="center" prop="teacherName">
            </el-table-column>
            <el-table-column label="资源数" align="center" prop="resourceNum" />
            <el-table-column label="课程分类" align="center" prop="categoryName">
            </el-table-column>
            <el-table-column label="选课人数" align="center" prop="selectedNum" />
            <el-table-column label="综合评分" align="center" prop="avgScore">
                <template #default="scope">
                    {{ scope.row.avgScore ? scope.row.avgScore : '-' }}分
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                    <slot name="action" :row="scope.row"></slot>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize" @pagination="getList" />
    </div>
</template>

<script setup name="Course">
import { listCourse } from "@/api/manage/course";

const { proxy } = getCurrentInstance();

const courseList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);

const data = reactive({
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
    },
});

const { queryParams } = toRefs(data);

/** 查询课程管理列表 */
function getList() {
    loading.value = true;
    queryParams.value.params = {}
    listCourse(queryParams.value).then(response => {
        courseList.value = response.rows;
        courseList.value.forEach(item => {
            item.cover = proxy.$previewUrl + item.cover
        })
        total.value = response.total;
        loading.value = false;
    });
}

/** 搜索按钮操作 */
function handleQuery() {
    queryParams.value.pageNum = 1;
    getList();
}

/** 重置按钮操作 */
function resetQuery() {
    proxy.resetForm("queryRef");
    handleQuery();
}

getList();
</script>