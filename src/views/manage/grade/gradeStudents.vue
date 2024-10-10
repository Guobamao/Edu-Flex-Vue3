<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px" @submit.prevent>
      <el-form-item label="学号" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入学生学号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="姓名" prop="nickName">
        <el-input v-model="queryParams.nickName" placeholder="请输入学生姓名" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="手机号码" prop="phonenumber">
        <el-input v-model="queryParams.phonenumber" placeholder="请输入手机号码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['manage:student:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['manage:student:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Upload" @click="handleImport"
          v-hasPermi="['manage:student:import']">导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['manage:student:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="studentList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="50" align="center" prop="stuId" />
      <el-table-column label="学号" align="center" prop="userName" />
      <el-table-column label="学生姓名" align="center" prop="nickName" />
      <el-table-column label="手机号码" align="center" prop="phonenumber">
        <template #default="scope">
          <span>{{ scope.row.phonenumber ? scope.row.phonenumber : '未设置' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="邮箱" align="center" prop="email" width="180">
        <template #default="scope">
          <span>{{ scope.row.email ? scope.row.email : '未设置' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <el-tag :type="scope.row.status == '0' ? '' : 'danger'">{{ scope.row.status == '0' ? '启用' : '停用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="最后一次登录" align="center" prop="loginDate">
        <template #default="scope">
          <span>{{ parseTime(scope.row.loginDate) ? parseTime(scope.row.loginDate) : '从未登录' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="300">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="getStudentInfo(scope.row)"
            v-hasPermi="['manage:student:query']">详情</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['manage:student:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['manage:student:remove']">删除</el-button>
          <el-button link type="primary" icon="key" @click="handleResetPwd(scope.row)"
            v-hasPermi="['manage:student:resetPwd']">重置密码</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改用户配置对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="studentRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="学号" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入学号" :disabled="form.stuId" />
        </el-form-item>
        <el-form-item label="学生姓名" prop="nickName">
          <el-input v-model="form.nickName" placeholder="请输入学生姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phonenumber">
          <el-input v-model="form.phonenumber" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-select v-model="form.sex" placeholder="请选择性别">
            <el-option v-for="dict in sys_user_sex" :key="dict.value" :label="dict.label"
              :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <el-input v-model="form.avatar" placeholder="请输入头像地址" />
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

    <!-- 用户导入对话框 -->
    <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
      <el-upload ref="uploadRef" :limit="1" accept=".xlsx, .xls" :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport" :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress" :on-success="handleFileSuccess" :auto-upload="false" drag>
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <div class="el-upload__tip">
              <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的用户数据
            </div>
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;"
              @click="importTemplate">下载模板</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="gradeStudents">
import { getToken } from "@/utils/auth";
import { listStudent, getStudent, delStudent, addStudent, updateStudent, resetStudentPwd } from "@/api/manage/student";

const route = useRoute();
const { proxy } = getCurrentInstance();
const { student_status, sys_user_sex } = proxy.useDict('student_status', 'sys_user_sex');

const studentList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

/*** 学生导入参数 */
const upload = reactive({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: "",
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: { Authorization: "Bearer " + getToken() },
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/manage/student/importData"
});

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: null,
    nickName: null,
    phonenumber: null,
    sex: null,
    gradeId: route.params && route.params.gradeId,
  },
  rules: {
    userName: [{ required: true, message: "学号不能为空", trigger: "blur" }],
    nickName: [{ required: true, message: "学生姓名不能为空", trigger: "blur" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询用户列表 */
function getList() {
  loading.value = true;
  const gradeId = route.params && route.params.gradeId;
  if (gradeId) {
    loading.value = true;
    listStudent(queryParams.value).then(response => {
      studentList.value = response.rows;
      total.value = response.total;
      loading.value = false;
    });
  }
};

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
};

/** 重置操作表单 */
function reset() {
  form.value = {
    stuId: null,
    collegeId: null,
    collegeName: null,
    gradeId: route.params && route.params.gradeId,
    gradeName: null,
    userName: null,
    nickName: null,
    phonenumber: null,
    email: null,
    sex: "2",
    status: "0",
    avatar: null
  };
  proxy.resetForm("studentRef");
};

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
};

/** 选择条数  */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.userName);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加学生";
};

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _stuId = row.id
  getStudent(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改学生信息";
    form.password = "";
  });
};

/** 提交按钮 */
function submitForm() {
  proxy.$refs["studentRef"].validate(valid => {
    if (valid) {
      if (form.value.stuId != undefined) {
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
};

/** 删除按钮操作 */
function handleDelete(row) {
  const stuIds = row.userName || ids.value;
  proxy.$modal.confirm('是否确认删除学生编号为"' + stuIds + '"的数据项？').then(function () {
    return delStudent(stuIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
};

/** 导出按钮操作 */
function handleExport() {
  proxy.download("system/user/export", {
    ...queryParams.value,
  }, `user_${new Date().getTime()}.xlsx`);
};

/** 重置密码按钮操作 */
function handleResetPwd(row) {
  proxy.$modal.confirm('是否确认重置"' + row.userName + '"的密码？').then(function () {
    resetStudentPwd(row);
  }).then(() => {
    proxy.$modal.msgSuccess("重置成功,新密码: Axy" + row.userName);
  }).catch(() => {
  })
};

/** 导入按钮操作 */
function handleImport() {
  upload.title = "学生导入";
  upload.open = true;
};

/** 下载模板操作 */
function importTemplate() {
  proxy.download("manage/student/importTemplate", {
  }, `student_template_${new Date().getTime()}.xlsx`);
};

/**文件上传中处理 */
const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true;
};

/** 文件上传成功处理 */
const handleFileSuccess = (response, file, fileList) => {
  upload.open = false;
  upload.isUploading = false;
  proxy.$refs["uploadRef"].handleRemove(file);
  proxy.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true });
  getList();
};

/** 提交上传文件 */
function submitFileForm() {
  proxy.$refs["uploadRef"].submit();
};

/** 查看学生详情 */
const stuInfoOpen = ref(false)
function getStudentInfo(row) {
  const _id = row.id
  getStudent(_id).then(response => {
    form.value = response.data;
    stuInfoOpen.value = true
  })
}

getList();
</script>
