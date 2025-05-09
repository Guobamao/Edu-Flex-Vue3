<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="课程名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入课程名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="课程方向" prop="directionId">
        <el-select v-model="queryParams.directionId" style="width: 200px;" filterable clearable placeholder="请选择课程方向"
          @change="() => { getCategoryList(); handleQuery() }">
          <el-option v-for="item in directionOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="课程分类" prop="categoryId">
        <el-select v-model="queryParams.categoryId" style="width: 200px;" filterable clearable placeholder="请选择课程分类"
          @change="handleQuery" :disabled="!queryParams.directionId">
          <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
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

    <el-table v-loading="loading" :data="courseList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="50" align="center" prop="id" />
      <el-table-column label="课程封面" align="center" prop="cover">
        <template #default="scope">
          <img :src="scope.row.cover" width="40%" height="10%" @click="handlePreview(scope.row.cover)" />
        </template>
      </el-table-column>
      <el-table-column label="课程名称" align="center" prop="name" show-overflow-tooltip />
      <el-table-column label="任课老师" align="center" prop="teacherName">
      </el-table-column>
      <el-table-column label="资源数" align="center" prop="resourceNum" />
      <el-table-column label="课程方向" align="center" prop="directionName">
      </el-table-column>
      <el-table-column label="课程分类" align="center" prop="categoryName">
      </el-table-column>
      <el-table-column label="选课人数" align="center" prop="selectedNum" />
      <el-table-column label="综合评分" align="center" prop="avgScore">
        <template #default="scope">
          {{ scope.row.avgScore ? scope.row.avgScore : '-' }}分
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="goToCourseChapters(scope.row)"
            v-hasRole="['admin', 'teacher']">查看章节</el-button>
          <el-button link type="primary" icon="Connection" @click="goToStudentCourses(scope.row)"
            v-hasRole="['admin', 'teacher']">查看学生</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasRole="['admin']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasRole="['admin']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改课程管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="courseRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="课程方向" prop="directionId">
          <el-select v-model="form.directionId" placeholder="请选择课程方向" clearable filterable @change="getCategoryList">
            <el-option v-for="item in directionOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择课程分类" clearable filterable :disabled="!form.directionId">
            <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="任课老师" prop="teacherId">
          <el-select v-model=form.teacherId placeholder="请选择任课老师" clearable>
            <el-option v-for="item in teacherList" :key="item.userId" :label="item.nickName" :value="item.userId" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="课程封面" prop="cover">
          <image-upload v-model="form.cover" :limit="1" :file-type="['image/jpeg', 'image/png']" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    
    <!-- 图片预览 -->
    <div>
      <el-image-viewer hide-on-click-modal @close="() => { showViewer = false }" v-if="showViewer"
        :url-list="previewList" />
    </div>
  </div>
</template>

<script setup name="Course">
import { listCourse, getCourse, delCourse, addCourse, updateCourse } from "@/api/manage/course";
import { listTeacher } from "@/api/manage/teacher";
import { loadAllParams } from '@/api/page';
import { listDirection } from "@/api/manage/direction";
import { listCategory } from "@/api/manage/category";

const router = useRouter();
const route = useRoute();
const { proxy } = getCurrentInstance();

const courseList = ref([]);
const categoryOptions = ref([]);
const directionOptions = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const showViewer = ref(false);
const previewList = ref([])

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    directionId: route.query.directionId || null,
    categoryId: route.query.categoryId || null,
  },
  rules: {
    name: [
      { required: true, message: "课程名称不能为空", trigger: "blur" }
    ],
    teacherId: [
      { required: true, message: "任课老师不能为空", trigger: "blur" }
    ],
    directionId: [
      { required: true, message: "课程方向不能为空", trigger: "blur" }
    ],
    categoryId: [
      { required: true, message: "课程分类不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询课程管理列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {}
  listCourse(queryParams.value).then(response => {
    courseList.value = response.rows;
    courseList.value.forEach(item => {
      item.cover = proxy.$previewUrl + item.cover
    })
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
    name: null,
    categoryId: null,
    teacherId: null,
    description: null,
    cover: null
  };
  proxy.resetForm("courseRef");
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
  title.value = "添加课程管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  getCategoryList();
  const _id = row.id || ids.value
  getCourse(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改课程管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["courseRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCourse(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCourse(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除课程编号为"' + _ids + '"的数据项？').then(function () {
    return delCourse(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/course/export', {
    ...queryParams.value
  }, `课程数据_${new Date().getTime()}.xlsx`)
}

const teacherList = ref([]);
function getTeacherList() {
  listTeacher(loadAllParams).then(resposne => {
    teacherList.value = resposne.rows;
  })
}

// 跳转到课程章节
function goToCourseChapters(row) {
  const _courseId = row.id;
  router.push("/admin/course/course-chapters/" + _courseId);
}

// 跳转到学生选课
function goToStudentCourses(row) {
  const _courseId = row.id;
  router.push("/admin/course/student_course/" + _courseId);
}

function getDirectionList() {
  const params = {
    ...loadAllParams,
    status: 1
  }
  listDirection(params).then(res => {
    directionOptions.value = res.rows;
  });
}

function getCategoryList() {
  const params = {
    ...loadAllParams,
    directionId: queryParams.value.directionId || form.value.directionId
  }
  listCategory(params).then(response => {
    categoryOptions.value = response.rows;
  })
}

// 预览图片
function handlePreview(url) {
  previewList.value = [url]
  showViewer.value = true
}

getTeacherList();
getDirectionList();
getList();
</script>
