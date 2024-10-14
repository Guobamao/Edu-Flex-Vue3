<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['manage:chapter:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Sort" @click="toggleExpandAll">展开/折叠</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-if="refreshTable" v-loading="loading" :data="chapterList" row-key="id" :default-expand-all="isExpandAll"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
      <el-table-column label="章节名称" align="left" header-align="center" prop="name">
        <template #default="scope">
          <strong v-if="scope.row.parentId === 0">{{ scope.row.name }}</strong>
          <span v-else>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="left" header-align="center" width="400" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['manage:chapter:edit']">修改</el-button>
          <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)"
            v-hasPermi="['manage:chapter:add']">新增资料</el-button>
          <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['manage:chapter:add']"
            v-if="scope.row.parentId === 0">新增小节</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['manage:chapter:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改课程内容章节管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="chapterRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="父级章节" prop="parentId">
          <el-tree-select v-model="form.parentId" :data="chapterOptions"
            :props="{ value: 'id', label: 'name', children: 'children' }" value-key="id" placeholder="请选择父级章节"
            check-strictly />
        </el-form-item>
        <el-form-item label="章节名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入章节名称" />
        </el-form-item>
        <el-form-item label="排序" prop="orderNum">
          <el-input v-model="form.orderNum" placeholder="请输入排序" />
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

<script setup name="Chapter">
import { listChapter, getChapter, delChapter, addChapter, updateChapter } from "@/api/manage/chapter";

const { proxy } = getCurrentInstance();
const route = useRoute();

const chapterList = ref([]);
const chapterOptions = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const title = ref("");
const isExpandAll = ref(true);
const refreshTable = ref(true);

const data = reactive({
  form: {},
  queryParams: {
  },
  rules: {
    name: [
      { required: true, message: "章节名称不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询课程内容章节管理列表 */
function getList() {
  loading.value = true;
  listChapter(queryParams.value).then(response => {
    chapterList.value = proxy.handleTree(response.data, "id", "parentId");
    loading.value = false;
  });
}

/** 查询课程内容章节管理下拉树结构 */
function getTreeselect() {
  listChapter().then(response => {
    chapterOptions.value = [];
    chapterOptions.value = proxy.handleTree(response.data, "id", "parentId");
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
    courseId: route.params && route.params.courseId,
    name: null,
    parentId: null,
    ancestors: null,
    orderNum: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("chapterRef");
}


/** 新增按钮操作 */
function handleAdd(row) {
  reset();
  getTreeselect();
  if (row != null && row.id) {
    form.value.parentId = row.id;
  }
  open.value = true;
  title.value = "添加课程内容章节管理";
}

/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  nextTick(() => {
    refreshTable.value = true;
  });
}

/** 修改按钮操作 */
async function handleUpdate(row) {
  reset();
  await getTreeselect();
  if (row != null) {
    form.value.parentId = row.parentId;
  }
  getChapter(row.id).then(response => {
    form.value = response.data;
    if (form.value.parentId == 0) {
      form.value.parentId = null;
    }
    open.value = true;
    title.value = "修改课程内容章节管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["chapterRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateChapter(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addChapter(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除课程内容章节管理编号为"' + row.id + '"的数据项？').then(function () {
    return delChapter(row.id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}
getList();
</script>
