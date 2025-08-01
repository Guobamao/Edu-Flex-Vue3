<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="68px">
      <el-form-item label="题库名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入题库名称"
          clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasRole="['admin', 'teacher']"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasRole="['admin', 'teacher']"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasRole="['admin', 'teacher']"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasRole="['admin', 'teacher']"
          >导出</el-button
        >
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="repoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="题库名称" align="center" prop="name" />
      <el-table-column label="关联课程" align="center" prop="courseName" show-overflow-tooltip />
      <el-table-column label="单选题" align="center" prop="singleChoiceCount" />
      <el-table-column label="多选题" align="center" prop="multipleChoiceCount" />
      <el-table-column label="判断题" align="center" prop="judgeCount" />
      <el-table-column label="填空题" align="center" prop="blankCount" />
      <el-table-column label="简答题" align="center" prop="shortAnswerCount" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="View"
            @click="goToQuestion(scope.row)"
            v-hasRole="['admin', 'teacher']"
            >查看题目</el-button
          >
          <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasRole="['admin', 'teacher']"
            >修改</el-button
          >
          <el-button
            link
            type="primary"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasRole="['admin', 'teacher']"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改题库管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="repoRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="题库名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入题库名称" />
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

<script setup name="Repo">
import { listRepo, getRepo, delRepo, addRepo, updateRepo } from "@/api/manage/repo";

const { proxy } = getCurrentInstance();

const route = useRoute();
const router = useRouter();

const repoList = ref([]);
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
    name: null,
    courseId: route.params.courseId,
  },
  rules: {
    name: [{ required: true, message: "题库名称不能为空", trigger: "blur" }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询题库管理列表 */
function getList() {
  loading.value = true;
  listRepo(queryParams.value).then((response) => {
    repoList.value = response.rows;
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
    courseId: route.params.courseId,
  };
  proxy.resetForm("repoRef");
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
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加题库管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value;
  getRepo(_id).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = "修改题库管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["repoRef"].validate((valid) => {
    if (valid) {
      if (form.value.id != null) {
        updateRepo(form.value).then((response) => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addRepo(form.value).then((response) => {
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
  proxy.$modal
    .confirm('是否确认删除题库管理编号为"' + _ids + '"的数据项？')
    .then(function () {
      return delRepo(_ids);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess("删除成功");
    })
    .catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    "manage/repo/export",
    {
      ...queryParams.value,
    },
    `【${repoList.value[0].courseName}】- 题库_${new Date().getTime()}.xlsx`
  );
}

/** 查看题目 */
function goToQuestion(row) {
  router.push({ name: "Question", query: { repoId: row.id } });
}
getList();
</script>
