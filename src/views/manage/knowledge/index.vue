<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="关联课程" prop="courseId">
        <el-select v-model="queryParams.courseId" placeholder="请选择关联课程" clearable @change="handleQuery"
          style="width: 150px;">
          <el-option v-for="item in courseOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="知识点名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入知识点名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasRole="['admin', 'teacher']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Sort" @click="toggleExpandAll">展开/折叠</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-if="refreshTable" v-loading="loading" :data="knowledgeList" row-key="id"
      :default-expand-all="isExpandAll">
      <el-table-column label="知识点名称" align="center" prop="name" />
      <el-table-column label="关联课程" prop="courseId">
        <template #default="scope">
          <div v-for="item in courseOptions" :key="item.id">
            <span v-if="scope.row.courseId === item.id">{{ item.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasRole="['admin', 'teacher']">修改</el-button>
          <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)"
            v-hasRole="['admin', 'teacher']">新增</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasRole="['admin', 'teacher']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改知识点分类对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="knowledgeRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="关联课程" prop="courseId">
          <el-select v-model="form.courseId" placeholder="请选择关联课程" clearable @change="handleQuery">
            <el-option v-for="item in courseOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="知识点名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入知识点名称" />
        </el-form-item>
        <el-form-item label="父级知识点" prop="parentId">
          <el-tree-select v-model="form.parentId" :data="knowledgeOptions"
            :props="{ value: 'id', label: 'name', children: 'children' }" value-key="id" placeholder="请选择父级知识点"
            check-strictly />
        </el-form-item>
        <el-form-item label="知识点描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
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

<script setup name="Knowledge">
import { listKnowledge, getKnowledge, delKnowledge, addKnowledge, updateKnowledge } from "@/api/manage/knowledge";
import { listCourse } from '@/api/manage/course';
import { loadAllParams } from '@/api/page';

const { proxy } = getCurrentInstance();

const knowledgeList = ref([]);
const knowledgeOptions = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const title = ref("");
const isExpandAll = ref(true);
const refreshTable = ref(true);

const data = reactive({
  form: {},
  queryParams: {
    courseId: null,
    name: null,
  },
  rules: {
    courseId: [
      { required: true, message: "关联课程不能为空", trigger: "blur" }
    ],
    name: [
      { required: true, message: "知识点名称不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

const courseOptions = ref([]);

/** 查询知识点分类列表 */
function getList() {
  loading.value = true;
  listKnowledge(queryParams.value).then(response => {
    console.log(response)
    knowledgeList.value = response.data;
    loading.value = false;
  });
}

/** 查询知识点分类下拉树结构 */
function getTreeselect() {
  listKnowledge().then(response => {
    knowledgeOptions.value = [];
    knowledgeOptions.value = proxy.handleTree(response.data, "id", "parentId");
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
    courseId: null,
    name: null,
    parentId: null,
    ancestors: null,
    description: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    deleted: null
  };
  proxy.resetForm("knowledgeRef");
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
  getTreeselect();
  if (row != null && row.id) {
    form.value.parentId = row.id;
  }
  open.value = true;
  title.value = "添加知识点分类";
}

/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  nextTick(() => {
    refreshTable.value = true;
  });
}

/** 修改按钮操作 */
async function handleUpdate(row) {
  reset();
  await getTreeselect();
  if (row != null) {
    form.value.parentId = row.parentId;
  }
  getKnowledge(row.id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改知识点分类";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["knowledgeRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateKnowledge(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addKnowledge(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除知识点分类编号为"' + row.id + '"的数据项？').then(function () {
    return delKnowledge(row.id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}


function getCourseList() {
  listCourse(loadAllParams).then(res => {
    courseOptions.value = res.rows
  })
}

getList();
getCourseList();
</script>
