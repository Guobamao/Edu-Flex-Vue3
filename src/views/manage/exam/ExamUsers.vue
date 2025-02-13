<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px" @submit.prevent>
            <el-form-item label="考生信息" prop="searchValue">
                <el-input v-model="queryParams.searchValue" placeholder="请输入考生信息" clearable
                    @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="请选择状态" clearable @change="handleQuery"
                    style="width: 150px;">
                    <el-option v-for="dict in common_status" :key="dict.value" :label="dict.label"
                        :value="dict.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="是否通过" prop="passed">
                <el-select v-model="queryParams.passed" placeholder="请选择是否通过" clearable @change="handleQuery"
                    style="width: 150px;">
                    <el-option v-for="dict in exam_passed" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-table v-loading="loading" :data="recordList">
            <el-table-column label="序号" type="index" width="50" align="center" />
            <el-table-column label="学号" align="center" prop="userName" />
            <el-table-column label="姓名" align="center" prop="nickName" />
            <el-table-column label="分数" align="center" prop="score">
                <template #default="scope">
                    {{ scope.row.score ? scope.row.score : '-' }}
                </template>
            </el-table-column>
            <el-table-column label="状态" align="center" prop="status">
                <template #default="scope">
                    <dict-tag :options="common_status" :value="scope.row.status" />
                </template>
            </el-table-column>
            <el-table-column label="是否通过" align="center" prop="passed">
                <template #default="scope">
                    <dict-tag :options="exam_passed" :value="scope.row.passed" />
                </template>
            </el-table-column>
            <el-table-column label="开始时间" align="center" prop="startTime">
                <template #default="scope">
                    {{ scope.row.startTime ? scope.row.startTime : '-' }}
                </template>
            </el-table-column>
            <el-table-column label="结束时间" align="center" prop="endTime">
                <template #default="scope">
                    {{ scope.row.endTime ? scope.row.endTime : '-' }}
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-button link type="primary" icon="Document" @click="handleDetail(scope.row)"
                        v-if="scope.status !== 0">
                        详情
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize" @pagination="getList" />
    </div>
</template>

<script setup name="ExamUsers">
import { listRecord } from "@/api/manage/examRecord";

const { proxy } = getCurrentInstance();

const { common_status } = proxy.useDict("common_status")
const { exam_passed } = proxy.useDict("exam_passed")

const route = useRoute();
const router = useRouter();

const queryParams = ref({
    pageNum: 1,
    pageSize: 10,
    examId: route.params.examId,
    passed: null,
    searchValue: null,
})

const loading = ref(true);
const total = ref(0);
const recordList = ref([]);

function getList() {
    loading.value = true;
    listRecord(queryParams.value).then(res => {
        recordList.value = res.rows;
        total.value = res.total;
        loading.value = false;
    })
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

function handleDetail(row) {
    router.push("/admin/exams/exam/record/" + row.id)
}
getList();
</script>