<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px" @submit.prevent>
      <el-form-item label="所属学院" prop="collegeId">
        <el-tree-select v-model="queryParams.collegeId" :data="collegeOptions" style="width: 250px;" filterable clearable
          :props="{ value: 'id', label: 'name', children: 'children' }" value-key="id" placeholder="请选择所属学院" />
      </el-form-item>
      <el-form-item label="所属班级" prop="gradeId">
        <el-select v-model="queryParams.gradeId" placeholder="请选择所属班级" clearable style="width: 240px;"
          @change="handleQuery" @clear="handleQuery">
          <el-option v-for="item in gradeList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="登录名" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入学生登录名" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="姓名" prop="nickName">
        <el-input v-model="queryParams.nickName" placeholder="请输入学生姓名" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasRole="['admin']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasRole="['admin']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasRole="['admin']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasRole="['admin']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="studentList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="50" align="center" prop="id" />
      <el-table-column label="登录名" align="center" prop="userName" />
      <el-table-column label="学生姓名" align="center" prop="nickName" />
      <el-table-column label="所属学院" align="center" prop="collegeId">
        <template #default="scope">
          <div v-for="item in collegeList" :key="item.id">
            <span v-if="scope.row.collegeId === item.id">{{ item.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="所属班级" align="center" prop="gradeId">
        <template #default="scope">
          <div v-for="item in gradeList" :key="item.id">
            <span v-if="scope.row.gradeId === item.id">{{ item.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="300">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="getStudentInfo(scope.row)"
            v-hasRole="['admin']">详情</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasRole="['admin']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasRole="['admin']">删除</el-button>
          <el-button link type="primary" icon="key" @click="resetPwd(scope.row)" v-hasRole="['admin']">重置密码</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改学生管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="studentRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="登录名" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入登录名" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!form.userId">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="学生姓名" prop="nickName">
          <el-input v-model="form.nickName" placeholder="请输入学生姓名" />
        </el-form-item>
        <el-form-item label="所属学院" prop="collegeId">
          <el-select v-model="form.collegeId" placeholder="请选择所属学院" clearable @change="getGradeOption()">
            <el-option v-for="item in collegeList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属班级" prop="gradeId">
          <el-select v-model="form.gradeId" placeholder="请选择所属班级" clearable>
            <el-option v-for="item in gradeOption" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号码" prop="phonenumber">
          <el-input v-model="form.phonenumber" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-select v-model="form.sex" placeholder="请选择性别">
            <el-option v-for="dict in sys_user_sex" :key="dict.value" :label="dict.label" :value="dict.value" />
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

    <!-- 学生详情对话框 -->
    <el-dialog title="学生详情" v-model="stuInfoOpen" width="500" append-to-body>
      <el-descriptions direction="vertical" border style="margin-top: 20px">
        <el-descriptions-item :rowspan="2" :width="140" label="头像" align="center">
          <el-image style="width: 100px; height: 100px"
            src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
        </el-descriptions-item>
        <el-descriptions-item label="用户名">{{ form.userName }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ form.nickName }}</el-descriptions-item>
        <el-descriptions-item label="手机号码">{{ form.phonenumber ? form.phonenumber : '暂未设置' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ form.email ? form.email : '暂未设置' }}</el-descriptions-item>
        <el-descriptions-item label="所属学院">{{ form.collegeName }}</el-descriptions-item>
        <el-descriptions-item label="所属班级">{{ form.gradeName }}</el-descriptions-item>
        <el-descriptions-item label="性别">
          <dict-tag :options="sys_user_sex" :value="form.sex" />
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

  </div>
</template>

<script setup name="Student">
import { listStudent, getStudent, delStudent, addStudent, updateStudent, resetStudentPwd } from "@/api/manage/student";
import { listCollege } from '@/api/manage/college';
import { loadAllParams } from '@/api/page';
import { listGrade } from '@/api/manage/grade';

const { proxy } = getCurrentInstance();
const { sys_user_sex } = proxy.useDict("sys_user_sex");

const studentList = ref([]);
const collegeOptions = ref([]);
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
    collegeId: null,
    gradeId: null,
    userName: null,
    nickName: null
  },
  rules: {
    userName: [
      { required: true, message: "用户名不能为空", trigger: "blur" }
    ],
    nickName: [
      { required: true, message: "学生姓名不能为空", trigger: "blur" }
    ],
    collegeId: [
      { required: true, message: "所属学院不能为空", trigger: "blur" }
    ],
    gradeId: [
      { required: true, message: "所属班级不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询学生管理列表 */
function getList() {
  loading.value = true;
  listStudent(queryParams.value).then(response => {
    studentList.value = response.rows;
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
    collegeId: null,
    gradeId: null
  };
  proxy.resetForm("studentRef");
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
  title.value = "添加学生管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  getGradeOption();
  const _id = row.id || ids.value
  getStudent(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改学生管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["studentRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateStudent(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addStudent(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除学生管理编号为"' + _ids + '"的数据项？').then(function () {
    return delStudent(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/student/export', {
    ...queryParams.value
  }, `student_${new Date().getTime()}.xlsx`)
}

/** 获取学院列表 */
const collegeList = ref([]);
function getCollegeList() {
  listCollege(loadAllParams).then(response => {
    // 过滤掉根节点
    collegeList.value = response.rows.filter(item => item.parentId !== 0);
  })
  listCollege().then(res => {
    collegeOptions.value = proxy.handleTree(res.rows, 'id')
  })
}

/** 获取班级列表 */
const gradeList = ref([]);
function getGradeList() {
  const _collegeId = queryParams.value.collegeId
  listGrade({ collegeId: _collegeId }).then(response => {
    gradeList.value = response.rows;
  })
}

/** 获取班级列表 - 用于新增/修改 */
const gradeOption = ref([]);
function getGradeOption() {
  const _collegeId = form.value.collegeId
  listGrade({ collegeId: _collegeId }).then(response => {
    gradeOption.value = response.rows;
  })
}

/** 重置学生密码 */
// 密码默认为 Axy+学号(登录名)
function resetPwd(row) {
  const data = {
    userId: row.userId,
    userName: row.userName
  }
  resetStudentPwd(data).then(response => {
    proxy.$modal.msgSuccess("重置密码成功,密码为: Axy" + data.userName);
  })
}

/** 查看学生详情 */
const stuInfoOpen = ref(false)
function getStudentInfo(row) {
  const _id = row.id
  getStudent(_id).then(response => {
    form.value = response.data;
    stuInfoOpen.value = true
  })
}
getCollegeList();
getGradeList();
getList();
</script>
