<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="关联用户" prop="userId">
        <el-select v-model="queryParams.userId" placeholder="请选择关联用户" clearable @change="handleQuery"
          :options="studentOptions" style="width: 250px;" filterable remote :remote-method="onSearchStudent"
          :loading="stuLoading">
          <el-option v-for="item in studentOptions" :key="item.id" :label="item.nickName" :value="item.userId">
            <span style="float: left;">{{ item.nickName }}</span>
            <span style="float: right; color: #8492a6;">{{ item.userName }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="计划标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入计划标题" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['manage:plan:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['manage:plan:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['manage:plan:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['manage:plan:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="planList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="50" align="center" prop="id" />
      <el-table-column label="用户" align="center" prop="userId">
        <template #default="scope">
          {{ scope.row.nickName }}({{ scope.row.userName }})
        </template>
      </el-table-column>
      <el-table-column label="学习目标" align="center" prop="goalName">
        <template #default="scope">
          {{ scope.row.goalName }}
        </template>
      </el-table-column>
      <el-table-column label="计划标题" align="center" prop="title" />
      <el-table-column label="计划内容" align="center" prop="content" show-overflow-tooltip />
      <el-table-column label="开始时间" align="center" prop="startTime" width="180" />
      <el-table-column label="结束时间" align="center" prop="endTime" width="180" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['manage:plan:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['manage:plan:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改学习计划管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="planRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户" prop="userId">
          <el-select v-model="form.userId" placeholder="请选择关联用户" clearable :options="studentOptions" filterable remote
            :remote-method="onSearchStudent" :loading="stuLoading" @change="getGoalList">
            <el-option v-for="item in studentOptions" :key="item.id" :label="item.nickName" :value="item.userId">
              <span style="float: left;">{{ item.nickName }}</span>
              <span style="float: right; color: #8492a6;">{{ item.userName }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="学习目标" prop="goalId">
          <el-select v-model="form.goalId" placeholder="请选择学习目标" clearable :options="goalOptions" filterable
            :disabled="!form.userId">
            <el-option v-for="item in goalOptions" :key="item.id" :label="item.goalName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="计划标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入计划标题" />
        </el-form-item>
        <el-form-item label="计划内容" prop="content">
          <el-input v-model="form.content" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime" v-if="form.goalId">
          <el-date-picker clearable v-model="form.startTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择开始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime" v-if="form.goalId">
          <el-date-picker clearable v-model="form.endTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择结束时间">
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

<script setup name="Plan">
import { listPlan, getPlan, delPlan, addPlan, updatePlan } from "@/api/manage/plan";
import { listGoal } from "@/api/manage/goal";
import { listStudent } from "@/api/manage/student";
import { loadAllParams } from '@/api/page';

const { proxy } = getCurrentInstance();

const planList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");


const stuLoading = ref(false);
const studentOptions = ref([]);
const goalOptions = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userId: null,
    goalId: null,
    title: null,
    content: null,
    startTime: null,
    endTime: null,
  },
  rules: {
    userId: [
      { required: true, message: "用户ID不能为空", trigger: "blur" }
    ],
    goalId: [
      { required: true, message: "学习目标ID不能为空", trigger: "blur" }
    ],
    title: [
      { required: true, message: "计划标题不能为空", trigger: "blur" }
    ],
    content: [
      { required: true, message: "计划内容不能为空", trigger: "blur" }
    ],
    startTime: [
      { required: true, message: "开始时间不能为空", trigger: "blur" }
    ],
    endTime: [
      { required: true, message: "结束时间不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询学习计划管理列表 */
function getList() {
  loading.value = true;
  listPlan(queryParams.value).then(response => {
    planList.value = response.rows;
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
    goalId: null,
    title: null,
    content: null,
    startTime: null,
    endTime: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    deleted: null
  };
  proxy.resetForm("planRef");
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
  title.value = "添加学习计划管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  onSearchStudent(row.userName);
  getGoalList();
  const _id = row.id || ids.value
  getPlan(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改学习计划管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["planRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updatePlan(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addPlan(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除学习计划管理编号为"' + _ids + '"的数据项？').then(function () {
    return delPlan(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/plan/export', {
    ...queryParams.value
  }, `plan_${new Date().getTime()}.xlsx`)
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

function getGoalList() {
  const params = {
    ...loadAllParams,
    userId: form.value.userId
  }
  listGoal(params).then(res => {
    goalOptions.value = res.rows
  })
}

getList();
</script>
