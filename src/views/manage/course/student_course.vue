// 学生选课
<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="关联学生" prop="userId">
        <el-select v-model="queryParams.userId" placeholder="请选择关联学生" clearable @change="handleQuery"
          :options="studentOptions" style="width: 250px;" filterable remote :remote-method="onSearchStudent"
          :loading="stuLoading">
          <el-option v-for="item in studentOptions" :key="item.id" :label="item.nickName" :value="item.userId">
            <span style="float: left;">{{ item.nickName }}</span>
            <span style="float: right; color: #8492a6;">{{ item.userName }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="进度(%)" prop="progress">
        <el-slider v-model="queryParams.progressList" range :max="100" :precision="2" @change="handleQuery"
          :format-tooltip="formatTooltip" style="width: 200px;" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable @change="handleQuery"
          style="width: 150px;">
          <el-option v-for="dict in common_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['manage:student_course:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['manage:student_course:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="StudentCourseList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" width="50" type="index" align="center" prop="id" />
      <el-table-column label="学号" align="center" prop="userName" />
      <el-table-column label="学生姓名" align="center" prop="nickName" />
      <el-table-column label="课程名称" align="center" prop="courseName" />
      <el-table-column label="学习进度(%)" align="center" prop="progress">
        <template #default="scope">
          {{ scope.row.progress.toFixed(2) }}%
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="common_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="完成时间" align="center" prop="finishTime">
        <template #default="scope">
          <span v-if="scope.row.finishTime">{{ scope.row.finishTime }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasRole="['admin']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasRole="['admin']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改学生选课对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="StudentCourseRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="关联学生" prop="userId">
          <el-select v-model="form.userId" placeholder="请选择关联学生" clearable :options="studentOptions" filterable remote
            :remote-method="onSearchStudent" :loading="stuLoading" :disabled="form.id">
            <el-option v-for="item in studentOptions" :key="item.id" :label="item.nickName" :value="item.userId">
              <span style="float: left;">{{ item.nickName }}</span>
              <span style="float: right; color: #8492a6;">{{ item.userName }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关联课程" prop="courseId">
          <el-select v-model="form.courseId" placeholder="请选择关联课程" clearable :disabled="form.id">
            <el-option v-for="item in courseOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" clearable>
            <el-option v-for="dict in common_status" :key="dict.value" :label="dict.label"
              :value="parseInt(dict.value)" />
          </el-select>
        </el-form-item>
        <el-form-item label="进度(%)" prop="progress" v-if="form.status !== 0">
          <el-input v-model="form.progress" placeholder="请输入学习进度(%)" />
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

<script setup name="StudentCourse">
import { listStudentCourse, getStudentCourse, delStudentCourse, addStudentCourse, updateStudentCourse } from "@/api/manage/studentCourse";
import { listCourse } from '@/api/manage/course';
import { listStudent } from "@/api/manage/student";
import { loadAllParams } from '@/api/page';

const { proxy } = getCurrentInstance();

const route = useRoute();

const { common_status } = proxy.useDict("common_status");

const StudentCourseList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

// 格式化进度条
const formatTooltip = (val) => {
  return Number(val).toFixed(2)
}


const courseOptions = ref([]);

const stuLoading = ref(false);
const studentOptions = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userId: null,
    courseId: route.params.courseId,
    status: null,
    progressList: [0, 100],
  },
  rules: {
    userId: [
      { required: true, message: "关联学生不能为空", trigger: "change" }
    ],
    courseId: [
      { required: true, message: "关联课程不能为空", trigger: "change" }
    ],
    progress: [
      { required: true, message: "学习进度(%)不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询学生选课列表 */
function getList() {
  loading.value = true;
  listStudentCourse(queryParams.value).then(response => {
    StudentCourseList.value = response.rows;
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
    userId: null,
    courseId: null,
    status: null,
    progress: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    deleted: null
  };
  proxy.resetForm("StudentCourseRef");
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
  title.value = "添加学生选课";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  listStudent(loadAllParams).then(res => {
    studentOptions.value = res.rows;
  })

  getStudentCourse(_id).then(response => {
    response.data.progress = response.data.progress.toFixed(2)
    form.value = response.data;
    open.value = true;
    title.value = "修改学生选课";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["StudentCourseRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateStudentCourse(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addStudentCourse(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除学生选课编号为"' + _ids + '"的数据项？').then(function () {
    return delStudentCourse(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/student_course/export', {
    ...queryParams.value
  }, `StudentCourse_${new Date().getTime()}.xlsx`)
}

// 查询课程列表
onMounted(() => {
  listCourse(loadAllParams).then(res => {
    courseOptions.value = res.rows
  })
})

function onSearchStudent(keyword) {
  if (keyword) {
    stuLoading.value = true
    const params = {
      searchValue: keyword
    }
    listStudent(params).then(res => {
      studentOptions.value = res.rows
    }).catch(() => {
      studentOptions.value = []
    }).finally(() => {
      stuLoading.value = false
    })
  }
}

function showStudentCourse(row, searchType) {
  searchType === 0 ? queryParams.value.userId = row.userId : queryParams.value.courseId = row.courseId
  handleQuery()
}
getList();
</script>
