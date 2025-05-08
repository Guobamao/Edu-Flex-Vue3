<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable @change="handleQuery"
          style="width: 150px;">
          <el-option v-for="dict in homework_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasRole="['admin', 'teacher']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="studentHomeworkList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" width="50" type="index" align="center" prop="id" />
      <el-table-column label="学号" align="center" prop="userName" />
      <el-table-column label="学生姓名" align="center" prop="nickName" />
      <el-table-column label="课程名称" align="center" prop="courseName" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="homework_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="完成时间" align="center" prop="submitTime">
        <template #default="scope">
          <span v-if="scope.row.submitTime">{{ scope.row.submitTime }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleDetail(scope.row)"
            v-hasRole="['admin', 'teacher']">查看作业详情</el-button>
          <el-button v-if="scope.row.status === 1" link type="primary" icon="Edit" @click="handleCheck(scope.row)"
            v-hasRole="['admin', 'teacher']">批阅</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改学生选课对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="StudentHomeworkRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="作答内容" prop="answer">
          <div class="fullTextContent">
            <span v-html="form.answer"></span>
          </div>
        </el-form-item>
        <el-form-item v-if="isCheck || form.status === 2" label="得分" prop="score">
          <el-input-number v-model="form.score" :min="0" :max="100" :disabled="form.status === 2" />
        </el-form-item>
        <el-form-item v-if="isCheck || form.status === 2" label="批阅结果" prop="suggestion">
          <el-input v-model="form.suggestion" placeholder="请输入批阅结果" :disabled="form.status === 2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
          <el-button v-if="isCheck" type="primary" @click="handleSubmit">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="StudentHomework">
import { listStudentHomework, getStudentHomework, checkStudentHomework } from "@/api/manage/studentHomework";

const { proxy } = getCurrentInstance();

const route = useRoute();

const { homework_status } = proxy.useDict("homework_status");

const studentHomeworkList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const isCheck = ref(false);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    homeworkId: route.params.homeworkId,
    status: null,
  },
  rules: {
    score: [
      { required: true, message: "得分不能为空", trigger: "blur" }
    ],
    suggestion: [
      { required: true, message: "批阅结果不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询学生作业列表 */
function getList() {
  loading.value = true;
  listStudentHomework(queryParams.value).then(response => {
    studentHomeworkList.value = response.rows;
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
    homeworkId: null,
    answer: null,
    score: 0,
    suggestion: null,
  };
  proxy.resetForm("StudentHomeworkRef");
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

// 查看作业详情
function handleDetail(row) {
  reset();
  getStudentHomework(row.id).then(response => {
    form.value = response.data;
    isCheck.value = false;
    open.value = true;
    title.value = "学生作业详情";
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/student_homework/export', {
    ...queryParams.value
  }, `【${studentHomeworkList.value[0].courseName}】-学生作业数据_${new Date().getTime()}.xlsx`)
}

function handleCheck(row) {
  reset();
  getStudentHomework(row.id).then(response => {
    form.value = response.data;
    form.value.score = form.value.score || 0;
    open.value = true;
    title.value = "批阅作业";
    isCheck.value = true;
  });
}

function handleSubmit() {
  proxy.$refs["StudentHomeworkRef"].validate(valid => {
    if (valid) {
      proxy.$modal.confirm("是否确认提交批阅结果？").then(() => {
        checkStudentHomework(form.value).then(response => {
          proxy.$modal.msgSuccess("提交成功");
          open.value = false;
          getList();
        });
      });
    }
  })
}

getList();
</script>
<style lang="scss" scoped>
.fullTextContent {
  overflow-y: auto;
  width: 100%;
  max-height: 50vh;
  border: 1px solid #999;
  border-radius: 5px;
  padding: 0 10px;
}
</style>