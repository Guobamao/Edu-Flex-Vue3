<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px" @submit.prevent>
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入分类名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="关联方向" prop="directionId">
        <el-select v-model="queryParams.directionId" placeholder="请选择关联方向" clearable filterable @change="handleQuery"
          style="width: 150px;">
          <el-option v-for="item in directionOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-switch v-model="queryParams.status" :active-value="1" :inactive-value="0" @change="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasRole="['admin']">新增</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="categoryList">
      <el-table-column label="序号" width="50" type="index" align="center" />
      <el-table-column label="分类名称" prop="name" />
      <el-table-column label="关联方向" prop="directionName" />
      <el-table-column label="状态" prop="status">
        <template #default="scope">
          <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0"
            @change="handleStatusChange(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click.stop="handleUpdate(scope.row)"
            v-hasRole="['admin']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click.stop="handleDelete(scope.row)"
            v-hasRole="['admin']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改课程分类对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="categoryRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="关联方向" prop="directionId">
          <el-select v-model="form.directionId" placeholder="请选择关联方向" clearable filterable @change="handleQuery">
            <el-option v-for="item in directionOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
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
  </div>
</template>

<script setup name="Category">
import { listCategory, getCategory, delCategory, addCategory, updateCategory } from "@/api/manage/category";
import { listDirection } from "@/api/manage/direction"
import { loadAllParams } from '@/api/page';

const { proxy } = getCurrentInstance();

const categoryList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    directionId: null,
    status: 1,
  },
  rules: {
    name: [
      { required: true, message: "分类名称不能为空", trigger: "blur" }
    ],
    directionId: [
      { required: true, message: "关联方向不能为空", trigger: "change" }
    ],
    status: [
      { required: true, message: "分类状态不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

const directionOptions = ref([]);

/** 查询课程分类列表 */
function getList() {
  loading.value = true;
  listCategory(queryParams.value).then(response => {
    categoryList.value = response.rows;
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
    directionId: null,
    status: 1,
  };
  proxy.resetForm("categoryRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 新增按钮操作 */
function handleAdd(row) {
  reset();
  open.value = true;
  title.value = "添加课程分类";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  getCategory(row.id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改课程分类";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["categoryRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCategory(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCategory(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除课程分类编号为"' + row.id + '"的数据项？').then(function () {
    return delCategory(row.id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

function getDirectionList() {
  listDirection(loadAllParams).then(res => {
    directionOptions.value = res.rows;
  });
}

// 分类状态修改
function handleStatusChange(row) {
  const data = {
    id: row.id,
    status: row.status
  }
  updateCategory(data).then(() => {
    if (row.status == 1) {
      proxy.$modal.msgSuccess("启用成功");
    } else {
      proxy.$modal.msgSuccess("禁用成功");
    }
  })
}

getDirectionList();
getList();
</script>
