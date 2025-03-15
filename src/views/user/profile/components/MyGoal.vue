<template>
    <div class="goal-list">
        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasRole="['student']">新增</el-button>
            </el-col>
        </el-row>
        <el-table v-loading="loading" :data="goalList">
            <el-table-column label="序号" width="50" type="index" align="center" prop="id" />
            <el-table-column label="名称" align="center" prop="goalName" />
            <el-table-column label="目标完成日期" align="center" prop="deadline" />
            <el-table-column label="描述" align="center" prop="description" show-overflow-tooltip />
            <el-table-column label="状态" align="center" prop="status">
                <template #default="scope">
                    <dict-tag :options="goal_status" :value="scope.row.status" />
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-link link type="primary" icon="View" @click="handleView(scope.row)"
                        v-hasRole="['student']">查看</el-link>
                    <el-link link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                        v-hasRole="['student']">修改</el-link>
                    <el-link link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                        v-hasRole="['student']">删除</el-link>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize" @pagination="getList" />

        <!-- 查看学习目标详情对话框 -->
        <el-dialog title="学习目标详情" v-model="goalDetailOpen" width="500" append-to-body>
            <el-descriptions border :column="1" label-width="120px">
                <el-descriptions-item label="名称">{{ form.goalName }}</el-descriptions-item>
                <el-descriptions-item label="目标完成日期">{{ form.deadline }}</el-descriptions-item>
                <el-descriptions-item label="描述">{{ form.description }}</el-descriptions-item>
                <el-descriptions-item label="状态">
                    <dict-tag :options="goal_status" :value="form.status" />
                </el-descriptions-item>
            </el-descriptions>
        </el-dialog>

        <!-- 修改学习目标管理对话框 -->
        <el-dialog :title="title" v-model="open" width="500px" append-to-body>
            <el-form ref="goalRef" :model="form" :rules="rules" label-width="110px">
                <el-form-item label="名称" prop="goalName">
                    <el-input v-model="form.goalName" placeholder="请输入名称" />
                </el-form-item>
                <el-form-item label="目标完成日期" prop="deadline">
                    <el-date-picker v-model="form.deadline" type="date" placeholder="请选择目标完成日期"
                        value-format="YYYY-MM-DD" />
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input v-model="form.description" type="textarea" placeholder="请输入内容" :rows="3" />
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-select v-model="form.status" placeholder="请选择状态">
                        <el-option v-for="dict in goal_status" :key="dict.value" :label="dict.label"
                            :value="parseInt(dict.value)" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button type="primary" @click="submitForm">确 定</el-button>
                    <el-button @click="cancel">取 消</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>
<script setup name="MyGoal">
import { listGoal, getGoal, delGoal, addGoal, updateGoal } from "@/api/user/goal";

const { proxy } = getCurrentInstance();
const { goal_status } = proxy.useDict('goal_status')

const goalList = ref([]);
const open = ref(false);
const goalDetailOpen = ref(false);
const loading = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 10,
    },
    rules: {
        goalName: [
            { required: true, message: "名称不能为空", trigger: "blur" }
        ],
        deadline: [
            { required: true, message: "目标完成期限不能为空", trigger: "blur" }
        ],
    }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询学习目标管理列表 */
function getList() {
    loading.value = true;
    listGoal(queryParams.value).then(response => {
        goalList.value = response.rows;
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
        goalName: null,
        description: null,
        deadline: null,
        status: 0,
    };
    proxy.resetForm("goalRef");
}

/** 查看学习目标详情 */
function handleView(row) {
    getGoal(row.id).then(res => {
        form.value = res.data;
        goalDetailOpen.value = true;
    })
}

/** 新增按钮操作 */
function handleAdd() {
    reset();
    open.value = true;
    title.value = "添加学习目标管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
    reset();
    getGoal(row.id).then(response => {
        form.value = response.data;
        open.value = true;
        title.value = "修改学习目标管理";
    });
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs["goalRef"].validate(valid => {
        if (valid) {
            if (form.value.id != null) {
                updateGoal(form.value).then(response => {
                    proxy.$modal.msgSuccess("修改成功");
                    open.value = false;
                    getList();
                });
            } else {
                addGoal(form.value).then(response => {
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
    proxy.$modal.confirm('是否确认删除该学习目标？').then(function () {
        return delGoal(row.id);
    }).then(() => {
        getList();
        proxy.$modal.msgSuccess("删除成功");
    }).catch(() => { });
}


getList();
</script>
<style lang="scss" scoped>
.goal-list {
    .pagination-container {
        margin-bottom: 30px;
        background-color: transparent;
    }

    .el-link {
        margin-right: 8px;
    }
}
</style>