<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px" @submit.prevent>
      <el-form-item label="所属课程" prop="courseId">
        <el-select v-model="queryParams.courseId" placeholder="请选择所属课程" clearable @change="handleQuery"
          style="width: 150px;">
          <el-option v-for="item in courseOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="作业标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入作业标题" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="截止日期">
        <el-date-picker clearable v-model="dateRange" type="daterange" range-separator="-" value-format="YYYY-MM-DD"
          start-placeholder="开始日期" end-placeholder="结束日期">
        </el-date-picker>
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

    <el-table v-loading="loading" :data="homeworkList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" type="index" align="center" prop="id" />
      <el-table-column label="作业标题" align="center" prop="title" />
      <el-table-column label="作业内容" align="center" prop="content" />
      <el-table-column label="所属课程" align="center" prop="courseId">
        <template #default="scope">
          <div v-for="item in courseOptions" :key="item.id">
            <span v-if="scope.row.courseId === item.id">{{ item.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="截止日期" align="center" prop="deadline" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.deadline, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
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

    <!-- 添加或修改作业管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="homeworkRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="所属课程" prop="courseId">
          <el-select v-model="form.courseId" placeholder="请选择所属课程" clearable @change="handleQuery">
            <el-option v-for="item in courseOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="作业标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入作业标题" />
        </el-form-item>
        <el-form-item label="作业内容">
          <editor v-model="form.content" :min-height="192" />
        </el-form-item>
        <el-form-item label="截止日期" prop="deadline">
          <el-date-picker clearable v-model="form.deadline" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择截止日期">
          </el-date-picker>
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

<script setup name="Homework">
import { listHomework, getHomework, delHomework, addHomework, updateHomework } from "@/api/manage/homework";
import { listCourse } from '@/api/manage/course';
import { loadAllParams } from '@/api/page';
const { proxy } = getCurrentInstance();

const homeworkList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

// 日期范围
const dateRange = ref([])

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    courseId: null,
    title: null,
    deadline: null,
  },
  rules: {
    courseId: [
      { required: true, message: "所属课程ID不能为空", trigger: "blur" }
    ],
    title: [
      { required: true, message: "作业标题不能为空", trigger: "blur" }
    ],
    content: [
      { required: true, message: "作业内容不能为空", trigger: "blur" }
    ],
    deadline: [
      { required: true, message: "截止日期不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询作业管理列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {}
  if (dateRange && dateRange.value) {
    queryParams.value.params['startTime'] = dateRange.value[0];
    queryParams.value.params['endTime'] = dateRange.value[1];
  }
  listHomework(queryParams.value).then(response => {
    homeworkList.value = response.rows;
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
    courseId: null,
    title: null,
    content: null,
    deadline: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("homeworkRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  dateRange.value = [];
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
  title.value = "添加作业管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getHomework(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改作业管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["homeworkRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateHomework(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addHomework(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除作业管理编号为"' + _ids + '"的数据项？').then(function () {
    return delHomework(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/homework/export', {
    ...queryParams.value
  }, `homework_${new Date().getTime()}.xlsx`)
}

const courseOptions = ref([])
// 查询课程列表
function getCourseList() {
  listCourse(loadAllParams).then(response => {
    courseOptions.value = response.rows
  })
}

getList();
getCourseList();
</script>
