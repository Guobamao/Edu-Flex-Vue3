<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="试卷名称" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入试卷名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="是否发布" prop="isPublished">
        <el-input v-model="queryParams.isPublished" placeholder="请输入是否发布" clearable @keyup.enter="handleQuery" />
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
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasRole="['admin', 'teacher']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasRole="['admin', 'teacher']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasRole="['admin', 'teacher']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="paperList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="50" align="center" prop="id" />
      <el-table-column label="试卷名称" align="center" prop="title">
        <template #default="scope">
          <el-link type="primary" @click="goToCompose(scope.row)" v-hasRole="['admin', 'teacher']">{{ scope.row.title }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="总分" align="center" prop="totalScore" />
      <el-table-column label="考试时长" align="center" prop="duration" />
      <el-table-column label="是否发布" align="center" prop="isPublished">
        <template #default="scope">
          <dict-tag :options="paper_published" :value="scope.row.isPublished" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasRole="['admin', 'teacher']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasRole="['admin', 'teacher']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改试卷管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="paperRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="试卷名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入试卷名称" />
        </el-form-item>
        <el-form-item label="总分" prop="totalScore">
          <el-input v-model="form.totalScore" placeholder="请输入总分" />
        </el-form-item>
        <el-form-item label="考试时长" prop="duration">
          <el-input v-model="form.duration" placeholder="请输入考试时长" />
        </el-form-item>
        <el-form-item label="是否发布" prop="isPublished">
          <el-select v-model="form.isPublished" placeholder="请选择是否发布" clearable>
            <el-option v-for="dict in paper_published" :key="dict.value" :label="dict.label" :value="dict.value" />
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

<script setup name="Paper">
import { listPaper, getPaper, delPaper, addPaper, updatePaper } from "@/api/manage/paper";
import { useRouter } from "vue-router";

const router = useRouter();
const { proxy } = getCurrentInstance();

const { paper_published } = proxy.useDict('paper_published')
const paperList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: null,
    isPublished: null,
  },
  rules: {
    title: [
      { required: true, message: "试卷名称不能为空", trigger: "blur" }
    ],
    totalScore: [
      { required: true, message: "总分不能为空", trigger: "blur" }
    ],
    duration: [
      { required: true, message: "考试时长不能为空", trigger: "blur" }
    ],
    isPublished: [
      { required: true, message: "是否发布不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询试卷管理列表 */
function getList() {
  loading.value = true;
  listPaper(queryParams.value).then(response => {
    paperList.value = response.rows;
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
    title: null,
    totalScore: null,
    duration: null,
    isPublished: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    deleted: null
  };
  proxy.resetForm("paperRef");
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
  title.value = "添加试卷管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getPaper(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改试卷管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["paperRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updatePaper(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addPaper(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除试卷管理编号为"' + _ids + '"的数据项？').then(function () {
    return delPaper(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/paper/export', {
    ...queryParams.value
  }, `paper_${new Date().getTime()}.xlsx`)
}

function goToCompose(row) {
  const _paperId = row.id
  router.push("/base/paper-compose/" + _paperId);
}

getList();
</script>
