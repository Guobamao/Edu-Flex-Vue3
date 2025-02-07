<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="名称" prop="goalName">
        <el-input v-model="queryParams.goalName" placeholder="请输入名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['manage:goal:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['manage:goal:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['manage:goal:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['manage:goal:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="goalList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" width="50" type="index" align="center" prop="id" />
      <el-table-column label="名称" align="center" prop="goalName" />
      <el-table-column label="目标完成期限(天)" align="center" prop="deadline" />
      <el-table-column label="创建者" align="center" prop="createBy" width="80" />
      <el-table-column label="创建时间" align="center" prop="createTime" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-link type="primary" icon="User" @click="handleUser(scope.row)" v-hasRole="['admin']">关联用户</el-link>
          <el-link link type="primary" icon="Connection" @click="handleRoute(scope.row)"
            v-hasRole="['admin']">关联学习路线</el-link>
          <el-link link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['manage:goal:edit']">修改</el-link>
          <el-link link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['manage:goal:remove']">删除</el-link>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改学习目标管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="goalRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="goalName">
          <el-input v-model="form.goalName" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="完成期限" prop="deadline">
          <el-input-number v-model="form.deadline" placeholder="完成期限" />
          <span style="margin-left: 10px">天</span>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入内容" :rows="3" />
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

<script setup name="Goal">
import { listGoal, getGoal, delGoal, addGoal, updateGoal } from "@/api/manage/goal";
import { useRouter } from "vue-router";


const { proxy } = getCurrentInstance();

const goalList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const router = useRouter();

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    goalName: null,
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
    goalName: null,
    description: null,
    deadline: null,
  };
  proxy.resetForm("goalRef");
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
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加学习目标管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getGoal(_id).then(response => {
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
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除学习目标管理编号为"' + _ids + '"的数据项？').then(function () {
    return delGoal(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/goal/export', {
    ...queryParams.value
  }, `goal_${new Date().getTime()}.xlsx`)
}

/** 关联用户 */
function handleUser(row) {
  const _goalId = row.id;
  router.push("/study/goal/student/" + _goalId)
}

/** 关联学习路线 */
function handleRoute(row) {
  router.push({ name: 'Route', query: { goalId: row.id} })
}

getList();
</script>
<style lang="scss" scoped>
.el-link {
  margin-right: 8px;
}
</style>