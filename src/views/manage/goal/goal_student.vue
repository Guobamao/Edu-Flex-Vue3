<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
            <el-form-item label="关联学生" prop="userId">
                <el-select v-model="queryParams.userId" placeholder="请选择关联用户" clearable @change="handleQuery"
                    :options="studentOptions" style="width: 250px;" filterable remote :remote-method="onSearchStudent"
                    :loading="stuLoading">
                    <el-option v-for="item in studentOptions" :key="item.id" :label="item.nickName"
                        :value="item.userId">
                        <span style="float: left;">{{ item.nickName }}</span>
                        <span style="float: right; color: #8492a6;">{{ item.userName }}</span>
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="进度(%)" prop="progress">
                <el-slider v-model="queryParams.progress" range :max="100" :precision="2" @change="handleQuery"
                    :format-tooltip="formatTooltip" style="width: 200px;" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="请选择状态" clearable @change="handleQuery"
                    style="width: 150px;">
                    <el-option v-for="dict in study_status" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" plain icon="Plus" @click="handleAddUser" v-hasRole="['admin']">新增</el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="studentList">
            <el-table-column label="序号" width="50" type="index" align="center" prop="id" />
            <el-table-column label="学生姓名" align="center" prop="nickName" />
            <el-table-column label="关联学习目标" align="center" prop="goalName" />
            <el-table-column label="学习进度(%)" align="center" prop="progress">
                <template #default="scope">
                    {{ scope.row.progress ? scope.row.progress.toFixed(2) + '%' : '-' }}
                </template>
            </el-table-column>
            <el-table-column label="状态" align="center" prop="status">
                <template #default="scope">
                    <dict-tag :options="study_status" :value="scope.row.status" />
                </template>
            </el-table-column>
            <el-table-column label="结束时间" align="center" prop="deadline">
                <template #default="scope">
                    {{ scope.row.deadline ? scope.row.deadline : '-' }}
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-link type="primary" icon="Edit" @click="handleUpdate(scope.row)">修改</el-link>
                    <el-link type="primary" icon="Delete" @click="handleDelete(scope.row)">删除</el-link>
                </template>
            </el-table-column>
        </el-table>


        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize" @pagination="getList" />

        <!-- 添加或修改学生学习目标对话框 -->
        <el-dialog :title="title" v-model="open" width="700px" append-to-body>
            <el-table v-loading="dialogLoading" :data="allStudentList" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" align="center" />
                <el-table-column label="序号" width="50" type="index" align="center" prop="id" />
                <el-table-column label="学号" align="center" prop="userName" />
                <el-table-column label="姓名" align="center" prop="nickName" />
            </el-table>

            <pagination v-show="formTotal > 0" :total="formTotal" v-model:page="formQueryParams.pageNum"
                v-model:limit="formQueryParams.pageSize" @pagination="getAllStudent" />
            <template #footer>
                <div class="dialog-footer">
                    <el-button type="primary" @click="submitForm">确 定</el-button>
                    <el-button @click="cancel">取 消</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup name="GoalStudent">
import { listGoalStudent, getGoalStudent, addGoalStudent, updateGoalStudent, delGoalStudent } from "@/api/manage/goal_student";
import { listStudent } from "@/api/manage/student";
import { loadAllParams } from '@/api/page';
import { useRoute } from "vue-router";

const { proxy } = getCurrentInstance();
const { study_status } = proxy.useDict("study_status");
const route = useRoute();

const studentList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

// 格式化进度条
const formatTooltip = (val) => {
    return Number(val).toFixed(2)
}

const stuLoading = ref(false);
const studentOptions = ref([]);

const dialogLoading = ref(false);
const allStudentList = ref([]);
const formTotal = ref(0);

const data = reactive({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: null,
        progress: [0, 100],
        status: null,
        goalId: route.params.goalId
    },
    formQueryParams: {
        pageNum: 1,
        pageSize: 10,
    },
});

const { queryParams, form, formQueryParams } = toRefs(data);

/** 查询学习目标关联学生列表 */
function getList() {
    loading.value = true;
    listGoalStudent(queryParams.value).then(response => {
        studentList.value = response.rows;
        total.value = response.total;
        loading.value = false;
    });
}

// 取消按钮
function cancel() {
    open.value = false;
    reset();
}

// 表单重置
function reset() {
    form.value = {
        id: null,
        userId: null,
        goalId: route.params.goalId,
        status: '0',
        progress: null
    };
    proxy.resetForm("studentRef");
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

// 多选框选中数据
function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.id);
    single.value = selection.length != 1;
    multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAddUser() {
    reset();
    getAllStudent();
    open.value = true;
    title.value = "添加关联学生";
}

/** 修改按钮操作 */
function handleUpdate(row) {
    reset();
    const _id = row.id || ids.value
    listStudent(loadAllParams).then(res => {
        studentOptions.value = res.rows;
    })
    getGoalStudent(_id).then(response => {
        form.value = response.data;
        open.value = true;
        title.value = "修改关联学生学习目标";
    });
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs["studentRef"].validate(valid => {
        if (valid) {
            if (form.value.id != null) {
                updateGoalStudent(form.value).then(response => {
                    proxy.$modal.msgSuccess("修改成功");
                    open.value = false;
                    getList();
                });
            } else {
                addGoalStudent(form.value).then(response => {
                    proxy.$modal.msgSuccess("新增成功");
                    open.value = false;
                    getList();
                });
            }
        }
    });
}

/** 删除按钮操作 */
function handleDelete(row) {
    const _ids = row.id || ids.value;
    proxy.$modal.confirm('是否确认删除学习目标管理编号为"' + _ids + '"的数据项？').then(function () {
        return delGoalStudent(_ids);
    }).then(() => {
        getList();
        proxy.$modal.msgSuccess("删除成功");
    }).catch(() => { });
}
function onSearchStudent(keyword) {
    if (keyword) {
        stuLoading.value = true
        const params = {
            searchValue: keyword
        }
        listStudent(params).then(res => {
            studentOptions.value = res.rows
        }).catch(() => {
            studentOptions.value = []
        }).finally(() => {
            stuLoading.value = false
        })
    }
}

// 获取所有学生
function getAllStudent() {
    listStudent(formQueryParams.value).then(res => {
        allStudentList.value = res.rows;
        formTotal.value = res.total;
    })
}

getList();
</script>

<style lang="scss" scoped>
.el-link {
    margin-right: 8px;
}

::v-deep .el-pagination {
    margin-right: 20px;
}
</style>