<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="课程名称" prop="courseName">
        <el-input v-model="queryParams.courseName" style="width: 200px" placeholder="请输入课程名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="班级名称" prop="gradeName">
        <el-input v-model="queryParams.gradeName" style="width: 200px" placeholder="请输入班级名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['manage:courseGrade:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['manage:courseGrade:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['manage:courseGrade:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['manage:courseGrade:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="courseGradeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="50" align="center" prop="id" />
      <el-table-column label="课程名称" align="center" prop="courseName" />
      <el-table-column label="班级名称" align="center" prop="gradeName" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['manage:courseGrade:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['manage:courseGrade:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改班级课程管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="courseGradeRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="关联课程" prop="courseId">
          <el-select v-model="form.courseId" placeholder="请选择关联课程" clearable>
            <el-option v-for="item in courseList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="管理班级" prop="gradeId">
          <el-select v-model="form.gradeId" placeholder="请选择关联班级" clearable>
            <el-option v-for="item in gradeList" :key="item.id" :label="item.name" :value="item.id" />
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

<script setup name="CourseGrade">
import { listCourseGrade, getCourseGrade, delCourseGrade, addCourseGrade, updateCourseGrade } from "@/api/manage/courseGrade";
import { listGrade } from '@/api/manage/grade';
import { listCourse } from '@/api/manage/course';
import { loadAllParams } from '@/api/page';

const { proxy } = getCurrentInstance();

const courseGradeList = ref([]);
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
    courseName: null,
    gradeName: null,
  },
  rules: {
    courseId: [{ required: true, message: "课程ID不能为空", trigger: "blur" }],
    gradeId: [{ required: true, message: "班级ID不能为空", trigger: "blur" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询班级课程管理列表 */
function getList() {
  loading.value = true;
  listCourseGrade(queryParams.value).then(response => {
    courseGradeList.value = response.rows;
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
    gradeId: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("courseGradeRef");
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
  getGradeList();
  getCourseList();
  open.value = true;
  title.value = "添加班级课程管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  getGradeList();
  getCourseList();
  const _id = row.id || ids.value
  getCourseGrade(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改班级课程管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["courseGradeRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCourseGrade(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCourseGrade(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除班级课程管理编号为"' + _ids + '"的数据项？').then(function () {
    return delCourseGrade(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/courseGrade/export', {
    ...queryParams.value
  }, `courseGrade_${new Date().getTime()}.xlsx`)
}

/** 获取班级列表 */
const gradeList = ref([]);
function getGradeList() {
  listGrade(loadAllParams).then(response => {
    gradeList.value = response.rows;
  })
}

/** 获取课程列表 */
const courseList = ref([]);
function getCourseList() {
  listCourse(loadAllParams).then(response => {
    courseList.value = response.rows;
  })
}
getList();
</script>
