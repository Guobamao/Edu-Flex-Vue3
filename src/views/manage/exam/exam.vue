<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="考试名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入考试名称" clearable @keyup.enter="handleQuery"
          style="width: 150px;" />
      </el-form-item>
      <el-form-item label="试卷状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择试卷状态" clearable @change="handleQuery"
          @clear="handleQuery" style="width: 150px;">
          <el-option v-for="dict in common_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="发布状态" prop="published">
        <el-select v-model="queryParams.published" placeholder="请选择发布状态" clearable @change="handleQuery"
          @clear="handleQuery" style="width: 150px;">
          <el-option v-for="dict in exam_publish_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasRole="['manage:exam:add']">新增</el-button>
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

    <el-table v-loading="loading" :data="examList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="50" align="center" prop="id" />
      <el-table-column label="考试名称" width="150" align="center" prop="name" show-overflow-tooltip />
      <el-table-column label="关联课程" width="150" align="center" prop="courseName" />
      <el-table-column label="关联试卷" width="150" align="center" prop="paperName" />
      <el-table-column label="考试时长(分钟)" width="120" align="center" prop="duration" />
      <el-table-column label="考试状态" width="100" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="common_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="发布状态" width="100" align="center" prop="published">
        <template #default="scope">
          <dict-tag :options="exam_publish_status" :value="scope.row.published" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="success" icon="Open" @click="handleStatus(scope.row)" v-if="scope.row.status === 0">
            开始
          </el-button>
          <el-button link type="danger" icon="TurnOff" @click="handleStatus(scope.row)"
            v-else-if="scope.row.status === 1">
            结束
          </el-button>
          <el-button link type="primary" icon="RefreshLeft" @click="handleStatus(scope.row)"
            v-else-if="scope.row.status === 2">
            重新开始
          </el-button>
          <el-button link type="warning" icon="FolderRemove" @click="handlePublish(scope.row)"
            v-if="scope.row.published">
            收回
          </el-button>
          <el-button link type="primary" icon="FolderChecked" @click="handlePublish(scope.row)" v-else>
            发布
          </el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasRole="['admin', 'teacher']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
            v-hasRole="['admin', 'teacher']">删除</el-button>
          <el-button link type="primary" icon="Connection" @click="goToExamUser(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改考试管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="examRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="关联试卷" prop="paperId">
          <el-select v-model="form.paperId" placeholder="请选择关联试卷" filterable @change="handleSelectPaper">
            <el-option v-for="item in paperOptions" :key="item.id" :label="item.title" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="考试名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入考试名称" />
        </el-form-item>
        <el-form-item label="总分数" prop="totalScore">
          <el-input-number v-model="form.totalScore" placeholder="总分数" disabled />
          <span class="ml5">分</span>
        </el-form-item>
        <el-form-item label="及格分数" prop="passScore">
          <el-input-number v-model="form.passScore" placeholder="及格分数" :min="0" :max="form.totalScore" />
          <span class="ml5">分</span>
        </el-form-item>
        <el-form-item label="考试时长" prop="duration">
          <el-input-number v-model="form.duration" placeholder="考试时长" />
          <span class="ml5">分钟</span>
        </el-form-item>
        <el-form-item label="是否限时" prop="limited">
          <el-checkbox v-model="form.limited" label="限时" :true-value="1" :false-label="0"></el-checkbox>
        </el-form-item>
        <el-form-item label="考试时间" prop="['startTime', 'endTime']" v-if="form.limited === 1">
          <el-date-picker clearable v-model="dateRange" type="datetimerange" start-placeholder="开始日期"
            end-placeholder="结束日期" range-separator="至" value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="new Date(2025, 2, 2, 12, 0, 0)">
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

    <el-dialog title="设置发布信息" v-model="publishOpen" width="500px" append-to-body>
      <el-form ref="publishRef" :model="publishForm" :rules="publishRules" label-width="80px">
        <el-form-item label="是否限时" prop="limited">
          <el-checkbox v-model="publishForm.limited" label="限时" :true-value="1" :false-label="0" />
        </el-form-item>
        <el-form-item label="发布时间" prop="['startTime', 'endTime']" v-if="publishForm.limited === 1">
          <el-date-picker clearable v-model="publishDateRange" type="datetimerange" start-placeholder="开始日期"
            end-placeholder="结束日期" range-separator="至" value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="new Date(2025, 2, 2, 12, 0, 0)">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="publishSubmitForm">发 布</el-button>
          <el-button @click="publishOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Exam">
import { listExam, getExam, delExam, addExam, updateExam } from "@/api/manage/exam";
import { listPaper } from "@/api/manage/paper";
import { loadAllParams } from "@/api/page";

const { proxy } = getCurrentInstance();

const router = useRouter();
const route = useRoute();

const { common_status } = proxy.useDict("common_status")
const { exam_publish_status } = proxy.useDict("exam_publish_status")

const examList = ref([]);
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
    courseId: route.params.courseId,
    name: null,
    status: null,
    published: null
  },
  rules: {
    paperId: [
      { required: true, message: "关联试卷不能为空", trigger: "change" }
    ],
    name: [
      { required: true, message: "考试名称不能为空", trigger: "blur" }
    ],
    totalScore: [
      { required: true, message: "总分数不能为空", trigger: "blur" }
    ],
    passScore: [
      { required: true, message: "及格分数不能为空", trigger: "blur" }
    ],
    duration: [
      { required: true, message: "考试时长不能为空", trigger: "blur" }
    ],
    limited: [
      { required: true, message: "是否限时不能为空", trigger: "blur" }
    ],
    startTime: [
      { required: true, message: "考试时间不能为空", trigger: "blur" }
    ],
    endTime: [
      { required: true, message: "考试时间不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

const paperOptions = ref([]);

const dateRange = computed({
  get() {
    return [form.value.startTime, form.value.endTime]
  },
  set([startTime, endTime]) {
    form.value.startTime = startTime;
    form.value.endTime = endTime;
  }
})

const publishOpen = ref(false)
const publishForm = ref({
  limited: 0,
  startTime: null,
  endTime: null
})
const publishRules = reactive({
  limited: [
    { required: true, message: "是否限时不能为空", trigger: "blur" }
  ],
  startTime: [
    { required: true, message: "考试时间不能为空", trigger: "blur" }
  ],
  endTime: [
    { required: true, message: "考试时间不能为空", trigger: "blur" }
  ]
})

const publishDateRange = computed({
  get() {
    return [publishForm.value.startTime, publishForm.value.endTime]
  },
  set([startTime, endTime]) {
    publishForm.value.startTime = startTime;
    publishForm.value.endTime = endTime;
  }
})

/** 查询考试管理列表 */
function getList() {
  loading.value = true;
  listExam(queryParams.value).then(response => {
    examList.value = response.rows;
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
    paperId: null,
    name: null,
    totalScore: null,
    passScore: null,
    duration: null,
    limited: 0,
    startTime: null,
    endTime: null
  };
  proxy.resetForm("examRef");
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
  title.value = "添加考试管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getExam(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改考试管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["examRef"].validate(valid => {
    if (valid) {
      if (form.value.limited === 1) {
        if (form.value.startTime == null || form.value.endTime == null) {
          proxy.$modal.msgError("考试时间不能为空");
          return;
        }
      }
      if (form.value.id != null) {
        updateExam(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addExam(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除考试管理编号为"' + _ids + '"的数据项？').then(function () {
    return delExam(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/exam/export', {
    ...queryParams.value
  }, `【${examList.value[0].courseName}】- 考试数据_${new Date().getTime()}.xlsx`)
}

// 获取试卷列表
function getPaperList() {
  const params = {
    ...loadAllParams,
    courseId: form.value.courseId
  }
  listPaper(params).then(res => {
    paperOptions.value = res.rows
  })
}

// 处理试卷相关字段
function handleSelectPaper() {
  form.value.totalScore = paperOptions.value.find(item => item.id === form.value.paperId).totalScore
}
// 处理发布
function handlePublish(row) {
  if (row.published) {
    proxy.$modal.confirm('是否确认取消考试管理编号为"' + row.id + '"的考试发布？').then(() => {
      return updateExam({
        id: row.id,
        published: 0,
        status: 0
      });
    }).then(() => {
      getList();
      proxy.$modal.msgSuccess("取消成功");
    }).catch(() => { });
  } else {
    publishForm.value = {
      id: row.id,
      limited: row.limited,
      startTime: row.startTime,
      endTime: row.endTime
    }
    publishOpen.value = true
  }
}

// 考试发布
function publishSubmitForm() {
  if (publishForm.value.limited === 1) {
    if (publishForm.value.startTime == null || publishForm.value.endTime == null) {
      proxy.$modal.msgError("考试时间不能为空");
      return;
    }
    if (Date.now() > Date.parse(publishForm.value.endTime)) {
      proxy.$modal.msgError("已过考试结束时间，请重新设置时间！");
      return;
    }
  }

  const data = {
    id: publishForm.value.id,
    limited: publishForm.value.limited,
    startTime: publishForm.value.limited ? publishForm.value.startTime : null,
    endTime: publishForm.value.limited ? publishForm.value.endTime : null,
    published: 1,
  }
  updateExam(data).then(res => {
    proxy.$modal.msgSuccess("发布成功")
    publishOpen.value = false
    getList()
  })
}

// 考试状态处理
function handleStatus(row) {
  if (row.status === 0) {
    if (!row.published) {
      // 考试未发布
      proxy.$modal.confirm('考试未发布，是否确认发布？').then(() => {
        publishForm.value = {
          id: row.id,
          limited: row.limited,
          startTime: row.startTime,
          endTime: row.endTime
        }
        publishOpen.value = true
      })
    } else {
      if (row.limited && Date.now() > Date.parse(row.endTime)) {
        proxy.$modal.msgWarning("已过考试时间，请重新设置时间！")
        publishForm.value = {
          id: row.id,
          limited: row.limited,
          startTime: row.startTime,
          endTime: row.endTime
        }
        publishOpen.value = true
      } else {
        proxy.$modal.confirm('是否确认开始考试管理编号为"' + row.id + '"的考试？').then(() => {
          const data = {
            id: row.id,
            status: 1
          }
          updateExam(data).then(res => {
            proxy.$modal.msgSuccess("开始成功")
            getList()
          })
        })
      }
    }
  } else if (row.status === 1) {
    proxy.$modal.confirm('是否确认结束考试管理编号为"' + row.id + '"的考试？').then(() => {
      const data = {
        id: row.id,
        status: 2
      }
      updateExam(data).then(res => {
        proxy.$modal.msgSuccess("结束成功")
        getList()
      })
    })
  } else if (row.status === 2) {
    proxy.$modal.confirm("是否确认重新开始考试管理编号为" + row.id + "的考试？").then(() => {
      if (!row.published) {
        // 考试未发布
        proxy.$modal.confirm('考试未发布，是否确认发布？').then(() => {
          publishForm.value = {
            id: row.id,
            limited: row.limited,
            startTime: row.startTime,
            endTime: row.endTime
          }
          publishOpen.value = true
        })
      } else {
        if (row.limited) {
          if (Date.now() > Date.parse(row.endTime)) {
            proxy.$modal.msgWarning("已过考试时间，请重新设置时间！")
            publishForm.value = {
              id: row.id,
              limited: row.limited,
              startTime: row.startTime,
              endTime: row.endTime
            }
            publishOpen.value = true
          } else {
            const data = {
              id: row.id,
              status: 1
            }
            updateExam(data).then(res => {
              proxy.$modal.msgSuccess("开始成功")
              getList()
            })
          }
        } else {
          const data = {
            id: row.id,
            status: 1
          }
          updateExam(data).then(res => {
            proxy.$modal.msgSuccess("开始成功")
            getList()
          })
        }
      }
    })
  }
}

function goToExamUser(row) {
  router.push("/admin/exams/exam/users/" + row.id)
}

getPaperList();
getList();
</script>
