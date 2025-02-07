<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px" @submit.prevent>
      <el-form-item label="学习目标" prop="goalId">
        <el-select v-model="queryParams.goalId" placeholder="请选择关联学习目标" clearable filterable style="width: 200px;"
          @change="handleQuery" :disabled="route.query.goalId">
          <el-option v-for="item in goalOptions" :key="item.id" :label="item.goalName" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['manage:route:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['manage:route:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['manage:route:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['manage:route:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="routeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="50" align="center" prop="id" />
      <el-table-column label="学习路线名称" align="center" prop="name" />
      <el-table-column label="学习目标" align="center" prop="goalName" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleView(scope.row)">查看</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['manage:route:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['manage:route:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改学习路线管理对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="routeRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="学习路线名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入学习路线名称" clearable :disabled="flag === 0" />
        </el-form-item>
        <el-form-item label="关联学习目标" prop="goalId">
          <el-select v-model="form.goalId" placeholder="请选择关联学习目标" filterable :disabled="flag === 0">
            <el-option v-for="item in goalOptions" :key="item.id" :label="item.goalName" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关联课程" prop="coursesId" class="course-container">
          <div v-for="(course, index) in courseOptions" :key="index" class="course-item">
            <!-- 封面 -->
            <el-image :src="course.cover" style="width: 68px; height: 68px" />
            <div class="course-info">
              <div class="header">
                <span class="courseName">课程名称：{{ course.name }}</span>
                <span class="teacherName">任课老师：{{ course.teacherName }}</span>
              </div>
              <div>
                <span class="label">分类：</span>
                <span>{{ course.categoryName }}</span>
              </div>
              <div>
                <span class="label">学习时间：</span>
                <span>{{ course.startTime }} - {{ course.endTime }}</span>
              </div>
            </div>
            <el-button type="danger" icon="Delete" text @click="removeCourse(index)" v-if="flag !== 0"></el-button>
          </div>
          <el-button type="primary" text @click="addCourse" v-if="flag !== 0">+ 添加课程</el-button>
        </el-form-item>
      </el-form>
      <CourseSelect v-model:visible="visible" :routeId="form.id" @selectCourse="selectCourse"></CourseSelect>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Route">
import { listRoute, getRoute, delRoute, addRoute, updateRoute } from "@/api/manage/route";
import { listGoal } from "@/api/manage/goal";
import { listCourseByIds } from "@/api/manage/course";
import { loadAllParams } from "@/api/page";
import CourseSelect from "./components/CourseSelect.vue";

const { proxy } = getCurrentInstance();
const route = useRoute();
const routeList = ref([]);
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
    goalId: route.query.goalId || null,
  },
  rules: {
    name: [
      { required: true, message: "学习路线名称不能为空", trigger: "blur" }
    ],
    goalId: [
      { required: true, message: "关联学习目标不能为空", trigger: "blur" }
    ],
    coursesId: [
      { required: true, message: "课程ID不能为空", trigger: "change" }
    ],
    orderNum: [
      { required: true, message: "课程排序不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

const goalOptions = ref([]); // 关联学习目标列表
const courseOptions = ref([]); // 关联课程列表
const flag = ref(0); // 操作表示 0-查看 1-新增 2-修改
const visible = ref(false); // 课程选择对话框显示状态

/** 查询学习路线管理列表 */
function getList() {
  loading.value = true;
  listRoute(queryParams.value).then(response => {
    routeList.value = response.rows;
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
    name: '',
    goalId: null,
    coursesId: [],
  };
  courseOptions.value = []
  proxy.resetForm("routeRef");
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

function handleView(row) {
  reset();
  flag.value = 0; // 查看
  const _id = row.id
  getRoute(_id).then(response => {
    form.value = response.data;

    // 解析关联课程ID
    form.value.coursesId = JSON.parse(form.value.coursesId);
    listCourseByIds(form.value.coursesId).then(res => {
      courseOptions.value = res.data;
      courseOptions.value.forEach(item => {
        item.cover = proxy.$previewUrl + item.cover
      })
    })
    open.value = true;
    title.value = "查看学习路线";
  });
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  flag.value = 1; // 新增
  open.value = true;
  title.value = "添加学习路线管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  flag.value = 2; // 修改
  const _id = row.id || ids.value
  getRoute(_id).then(response => {
    form.value = response.data;

    // 解析关联课程ID
    form.value.coursesId = JSON.parse(form.value.coursesId);
    listCourseByIds(form.value.coursesId).then(res => {
      courseOptions.value = res.data;
      courseOptions.value.forEach(item => {
        item.cover = proxy.$previewUrl + item.cover
      })
    })
    open.value = true;
    title.value = "修改学习路线管理";
  });
}

/** 提交按钮 */
function submitForm() {
  if (flag.value === 0) {
    open.value = false;
  } else {
    proxy.$refs["routeRef"].validate(valid => {
      if (valid) {
        form.value.coursesId = JSON.stringify(courseOptions.value.map(item => item.id))
        if (form.value.id != null) {
          updateRoute(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
          });
        } else {
          addRoute(form.value).then(response => {
            proxy.$modal.msgSuccess("新增成功");
          });
        }
        open.value = false;
        getList();
      }
    });
  }
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除学习路线管理编号为"' + _ids + '"的数据项？').then(function () {
    return delRoute(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/route/export', {
    ...queryParams.value
  }, `route_${new Date().getTime()}.xlsx`)
}

/** 获取学习目标下拉框数据 */
function getGoalList() {
  listGoal(loadAllParams).then(res => {
    goalOptions.value = res.rows
  })
}

/** 删除路线课程 */
function removeCourse(index) {
  courseOptions.value.splice(index, 1)
  form.value.coursesId = courseOptions.value.map(item => item.id)
}

/** 添加路线课程 */
function addCourse() {
  visible.value = true
}

function selectCourse(courseSelection, ids) {
  courseOptions.value.push(...courseSelection)
  form.value.coursesId.push(ids)
}
getGoalList();
getList();
</script>

<style lang="scss" scoped>
.course-container {
  :deep(.el-form-item__content) {
    display: flex;
    flex-direction: column;
    align-items: normal;
    line-height: 24px;

    .course-item {
      display: flex;
      align-items: center;
      border: 1px solid #c8c8c8;
      border-radius: 10px;
      padding: 10px;
      margin-bottom: 10px;

      .course-info {
        flex: 1;
        margin-left: 10px;

        .header {
          .courseName {
            font-weight: bold;
          }

          .teacherName {
            margin-left: 20px;
            font-weight: bold;
          }
        }

        .label {
          font-weight: bold;
        }
      }
    }
  }
}
</style>