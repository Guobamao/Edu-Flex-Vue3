<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px" @submit.prevent>
      <el-form-item label="作业标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入作业标题" clearable @keyup.enter="handleQuery" />
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
      <el-table-column label="序号" type="index" width="50" align="center" prop="id" />
      <el-table-column label="课程名称" align="center" prop="courseName" />
      <el-table-column label="作业标题" align="center" prop="title" />
      <el-table-column label="作业内容" align="center" prop="content" show-overflow-tooltip />
      <el-table-column label="已提交人数" width="100" align="center" prop="submitCount" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="goToStudentHomework(scope.row)"
            v-hasRole="['admin', 'teacher']">查看学生作业</el-button>
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
        <el-form-item label="作业标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入作业标题" />
        </el-form-item>
        <el-form-item label="作业内容">
          <editor v-model="form.content" :min-height="192" />
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
import { listCourse, getCourse } from '@/api/manage/course';
import { loadAllParams } from '@/api/page';

const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();

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
    courseId: route.params.courseId,
    title: null,
  },
  rules: {
    title: [
      { required: true, message: "作业标题不能为空", trigger: "blur" }
    ],
    content: [
      { required: true, message: "作业内容不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

const courseInfo = ref({});

/** 查询作业管理列表 */
function getList() {
  loading.value = true;
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
    courseId: route.params.courseId,
    title: null,
    content: null,
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
  }, `【${courseInfo.value.name}】课程作业_${new Date().getTime()}.xlsx`)
}

const courseOptions = ref([])
// 查询课程列表
function getCourseList() {
  listCourse(loadAllParams).then(response => {
    courseOptions.value = response.rows
  })
}

function goToStudentHomework(row) {
  router.push("/admin/course/student_homeworks/" + row.id);
}

function getCourseInfo() {
  getCourse(route.params.courseId).then(res => {
    courseInfo.value = res.data
  })
}

getList();
getCourseInfo();
getCourseList();
</script>
<style lang="scss" scoped>
</style>