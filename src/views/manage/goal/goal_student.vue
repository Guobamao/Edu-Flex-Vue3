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
            <template v-if="flag === 1">
                <!-- 新增 -->
                <el-form :model="formQueryParams" ref="formQueryRef" :inline="true" label-width="68px">
                    <el-form-item label="学号" prop="userName">
                        <el-input v-model="formQueryParams.userName" placeholder="请输入学生学号" clearable
                            @keyup.enter="handleFormQuery" />
                    </el-form-item>
                    <el-form-item label="姓名" prop="nickName">
                        <el-input v-model="formQueryParams.nickName" placeholder="请输入学生姓名" clearable
                            @keyup.enter="handleFormQuery" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" icon="Search" @click="handleFormQuery">搜索</el-button>
                        <el-button icon="Refresh" @click="handleResetQuery">重置</el-button>
                    </el-form-item>
                </el-form>
                <el-table ref="studentFormRef" v-loading="dialogLoading" :data="allStudentList"
                    @selection-change="handleSelectionChange">
                    <el-table-column type="selection" width="55" align="center" :selectable="isSelectable" />
                    <el-table-column label="序号" width="50" type="index" align="center" prop="id" />
                    <el-table-column label="学号" align="center" prop="userName" />
                    <el-table-column label="姓名" align="center" prop="nickName" />
                </el-table>

                <pagination v-show="formTotal > 0" :total="formTotal" v-model:page="formQueryParams.pageNum"
                    v-model:limit="formQueryParams.pageSize" @pagination="getAllStudent" />
            </template>

            <template v-else>
                <!-- 修改 -->
                <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
                    <el-form-item label="关联学生" prop="nickName">
                        <el-input v-model="form.nickName" disabled/>
                    </el-form-item>
                    <el-form-item label="关联学习目标" prop="goalName">
                        <el-input v-model="form.goalName" disabled/>
                    </el-form-item>
                    <el-form-item label="状态" prop="status">
                        <el-select v-model="form.status" placeholder="请选择状态">
                            <el-option v-for="dict in study_status" :key="dict.value" :label="dict.label" :value="dict.value"/>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="进度" prop="progress" v-if="parseInt(form.status) !== 0">
                        <el-input v-model="form.progress" placeholder="请输入进度" clearable />
                    </el-form-item>
                    <el-form-item label="结束时间" prop="deadline" v-if="parseInt(form.status) !== 0">
                        <el-date-picker clearable v-model="form.deadline" type="date" value-format="YYYY-MM-DD" placeholder="请选择结束时间" />
                    </el-form-item>
                </el-form>
            </template>
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
import { listStudent, listStudentWithGoal } from "@/api/manage/student";
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

const flag = ref(0);

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
        goalId: route.params.goalId,
        userName: null,
        nickName: null
    },
    rules: {
        userId: [
            { required: true, message: "关联学生不能为空", trigger: "change" }
        ],
        status: [
            { required: true, message: "状态不能为空", trigger: "change" }
        ],
        progress: [
            { required: true, message: "进度不能为空", trigger: "blur" }
        ]
    }
});

const { queryParams, formQueryParams, rules, form } = toRefs(data);

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
        nickName: null,
        goalName: null,
        status: '0',
        progress: null,
        deadline: null
    }
    proxy.resetForm("formRef");
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
    ids.value = selection.map(item => item.userId);
    single.value = selection.length != 1;
    multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAddUser() {
    getAllStudent();
    flag.value = 1;
    open.value = true;
    title.value = "添加关联学生";
}

/** 修改按钮操作 */
function handleUpdate(row) {
    flag.value = 0;
    reset();
    const _id = row.id || ids.value
    getGoalStudent(_id).then(response => {
        form.value = response.data;
        open.value = true;
        title.value = "修改关联学生学习目标";
    });
}

/** 提交按钮 */
function submitForm() {
    if (ids.value.length === 0) {
        // 更新
        updateGoalStudent(form.value).then(res => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            getList();
        });
    } else {
        ids.value.forEach(item => {
            const data = {
                userId: item,
                goalId: route.params.goalId,
            }
            addGoalStudent(data).then(res => {
                proxy.$modal.msgSuccess("关联成功")
                open.value = false
                getList()
            })
        })
    }
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
    listStudentWithGoal(formQueryParams.value).then(res => {
        allStudentList.value = res.rows;
        formTotal.value = res.total;
    })
}

function isSelectable(row) {
    return !row.isSelected;
}

function handleFormQuery() {
    formQueryParams.value.pageNum = 1;
    getAllStudent();
}

function handleResetQuery() {
    proxy.resetForm("formQueryRef")
    handleFormQuery();
}

getList();
</script>

<style lang="scss" scoped>
.el-link {
    margin-right: 8px;
}

:deep(.el-pagination) {
    margin-right: 20px;
}
</style>