<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="关联课程" prop="courseId">
        <el-select v-model="queryParams.courseId" placeholder="请选择关联课程" clearable @change="handleQuery"
          @clear="handleQuery" :options="courseOptions" style="width: 150px;" filterable>
          <el-option v-for="item in courseOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
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
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
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

    <el-table v-loading="loading" :data="commentsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="50" align="center" prop="id" />
      <el-table-column label="课程名称" width="200" align="center" prop="courseName" show-overflow-tooltip>
        <template #default="scope">
          <el-link type="primary" @click="goToCourse(scope.row)" v-hasRole="['admin']">
            {{ scope.row.courseName }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="用户名" align="center" prop="userName">
        <template #default="scope">
          <el-link type="primary" @click="goToUser(scope.row)" v-hasRole="['admin']">
            {{ scope.row.userName }} ({{ scope.row.nickName }})
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="评论内容" align="center" prop="content" show-overflow-tooltip />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['manage:comments:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['manage:comments:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 修改评论管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="commentsRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="关联课程" prop="courseId">
          <el-select v-model="form.courseId" placeholder="请选择关联课程" :options="courseOptions" filterable>
            <el-option v-for="item in courseOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联用户" prop="userId">
          <el-select v-model="form.userId" placeholder="请选择关联用户" :options="studentOptions" filterable remote
            :remote-method="onSearchStudent" :loading="stuLoading">
            <el-option v-for="item in studentOptions" :key="item.userId" :label="item.nickName" :value="item.userId" />
          </el-select>
        </el-form-item>
        <el-form-item label="评论内容">
          <editor v-model="form.content" :min-height="192" />
        </el-form-item>
        <el-form-item label="父级评论" prop="parentId">
          <el-input v-model="form.parentId" placeholder="请输入父级评论" />
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

<script setup name="Comments">
import { listComments, getComments, delComments, updateComments } from "@/api/manage/comments";
import { listCourse } from "@/api/manage/course";
import { listStudent } from "@/api/manage/student";
import { loadAllParams } from '@/api/page';
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const { proxy } = getCurrentInstance();

const commentsList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const courseOptions = ref([]);

const stuLoading = ref(false);
const studentOptions = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    courseId: null,
    userId: null,
  },
  rules: {
    courseId: [
      { required: true, message: "关联课程不能为空", trigger: "blur" }
    ],
    userId: [
      { required: true, message: "关联用户不能为空", trigger: "blur" }
    ],
    content: [
      { required: true, message: "评论内容不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询评论管理列表 */
function getList() {
  loading.value = true;
  listComments(queryParams.value).then(response => {
    commentsList.value = response.rows;
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
    userId: null,
    content: null,
    parentId: null,
  };
  proxy.resetForm("commentsRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  studentOptions.value = [];
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
  const _id = row.id || ids.value
  listStudent(loadAllParams).then(res => {
    studentOptions.value = res.rows;
  })
  getComments(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改评论管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["commentsRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateComments(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
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
  proxy.$modal.confirm('是否确认删除评论管理编号为"' + _ids + '"的数据项？').then(function () {
    return delComments(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/comments/export', {
    ...queryParams.value
  }, `comments_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  listCourse(loadAllParams).then(res => {
    courseOptions.value = res.rows
  })
})

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

// 查看课程所有评论
function goToCourse(row) {
  const _courseId = row.courseId
  router.push("/admin/comments/course-comments/" + _courseId)
}

// 查看用户所有评论
function goToUser(row) {
  const _userId = row.userId
  router.push("/admin/comments/user-comments/" + _userId);
}
getList();
</script>
