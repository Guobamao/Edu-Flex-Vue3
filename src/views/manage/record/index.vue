<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="关联学生" prop="stuId">
        <el-select v-model="queryParams.stuId" placeholder="请选择关联学生" clearable @change="handleQuery"
          :options="studentOptions" style="width:250px;" filterable remote :remote-method="onSearchStudent"
          :loading="stuLoading">
          <el-option v-for="item in studentOptions" :key="item.id" :label="item.nickName" :value="item.userId">
            <span style="float: left;">{{ item.nickName }}</span>
            <span style="float: right; color: #8492a6;">{{ item.userName }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关联课程" prop="courseId">
        <el-select v-model="queryParams.courseId" placeholder="请选择关联课程" clearable @change="handleQuery"
          style="width: 150px;">
          <el-option v-for="item in courseOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 150px;"
          @change="handleQuery">
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
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['manage:record:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="recordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" width="50" type="index" align="center" prop="id" />
      <el-table-column label="学号" align="center" prop="userName" />
      <el-table-column label="姓名" align="center" prop="nickName" />
      <el-table-column label="课程" align="center" prop="courseName" />
      <el-table-column label="完成时间" align="center" prop="completionTime" width="180">
        <template #default="scope">
          {{ parseInt(scope.row.status) === 2 ? scope.row.completionTime : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="common_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="课程进度(%)" align="center" prop="progress">
        <template #default="scope">
          {{ scope.row.progress ? scope.row.progress.toFixed(2) + '%' : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['manage:record:edit']">修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改学习记录管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="recordRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="学号" prop="userName">
          <el-input v-model="form.userName" disabled />
        </el-form-item>
        <el-form-item label="姓名" prop="nickName">
          <el-input v-model="form.nickName" disabled />
        </el-form-item>
        <el-form-item label="关联课程" prop="courseName">
          <el-input v-model="form.courseName" disabled />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in common_status" :key="dict.value" :label="dict.value">
              {{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="完成时间" prop="completionTime" v-if="parseInt(form.status) === 2">
          <el-date-picker clearable v-model="form.completionTime" type="date" value-format="YYYY-MM-DD"
            placeholder="请选择完成时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="课程进度(%)" prop="progress">
          <el-input v-model="form.progress" placeholder="请输入课程进度" />
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

<script setup name="Record">
import { listRecord, getRecord, updateRecord } from "@/api/manage/record";
import { listStudent } from "@/api/manage/student";
import { listCourse } from "@/api/manage/course";
import { loadAllParams } from '@/api/page';

const { proxy } = getCurrentInstance();
const { common_status } = proxy.useDict('common_status');

const recordList = ref([]);
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
    stuId: null,
    courseId: null,
    status: null,
  },
  rules: {
    userName: [
      { required: true, message: "学号不能为空", trigger: "blur" }
    ],
    nickName: [
      { required: true, message: "姓名不能为空", trigger: "blur" }
    ],
    courseName: [
      { required: true, message: "课程名称不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ],
    completionTime: [
      { required: true, message: "完成时间不能为空", trigger: "blur" }
    ],
    progress: [
      { required: true, message: "课程进度不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

const stuLoading = ref(false);
const studentOptions = ref([]);

const courseOptions = ref([]);

/** 查询学习记录管理列表 */
function getList() {
  loading.value = true;
  listRecord(queryParams.value).then(response => {
    recordList.value = response.rows;
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
    nickName: null,
    courseName: null,
    completionTime: null,
    status: null,
    progress: null,
  };
  proxy.resetForm("recordRef");
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


/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id
  getRecord(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改学习记录管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["recordRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateRecord(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/record/export', {
    ...queryParams.value
  }, `record_${new Date().getTime()}.xlsx`)
}

function onSearchStudent(keyword) {
  if (keyword) {
    stuLoading.value = true
    const params = {
      ...loadAllParams,
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

function getCourseList() {
  listCourse(loadAllParams).then(res => {
    courseOptions.value = res.rows
  })
}

getCourseList();
getList();
</script>
