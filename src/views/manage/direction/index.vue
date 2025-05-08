<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px" @submit.prevent>
      <el-form-item label="名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasRole="['admin']">新增</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="directionList">
      <el-table-column label="序号" width="50" type="index" align="center" />
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0"
            @change="handleStatusChange(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Connection" @click="handleViewCategory(scope.row)">
            关联分类
          </el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasRole="['admin']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasRole="['admin']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改课程方向对话框 -->
    <el-dialog :title="title" v-model="open" width="400px" append-to-body>
      <el-form ref="directionRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 关联分类对话框 -->
     <el-dialog :title="categoryTitle" v-model="categoryOpen" width="800px" append-to-body>
        <Category v-if="categoryOpen" :directionId="directionId" />
     </el-dialog>
  </div>
</template>

<script setup name="Direction">
import { listDirection, getDirection, delDirection, addDirection, updateDirection } from "@/api/manage/direction";
import Category from "./components/Category.vue";

const { proxy } = getCurrentInstance();

const directionList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const title = ref("");
const categoryTitle = ref("");
const categoryOpen = ref(false);
const directionId = ref(null);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
  },
  rules: {
    name: [
      { required: true, message: "名称不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "启用状态不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询课程方向列表 */
function getList() {
  loading.value = true;
  listDirection(queryParams.value).then(response => {
    directionList.value = response.rows;
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
    name: null,
    status: 1,
  };
  proxy.resetForm("directionRef");
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


/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加课程方向";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id
  getDirection(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改课程方向";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["directionRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateDirection(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addDirection(form.value).then(response => {
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
  const _id = row.id;
  proxy.$modal.confirm('是否确认删除课程方向编号为"' + _id + '"的数据项？').then(function () {
    return delDirection(_id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

// 状态修改
function handleStatusChange(row) {
  const data = {
    id: row.id,
    status: row.status
  }
  updateDirection(data).then(res => {
    if (row.status === 0) {
      proxy.$modal.msgSuccess("禁用成功");
    } else {
      proxy.$modal.msgSuccess("启用成功");
    }
  });
}

// 关联方向
function handleViewCategory(row) {
  categoryTitle.value = '关联分类 - ' + row.name;
  directionId.value = row.id;
  categoryOpen.value = true;
}

getList();
</script>
