<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="关联题库" prop="repoId">
        <el-select v-model="queryParams.repoId" placeholder="请选择关联题库" clearable filterable @change="handleQuery"
          style="width: 150px;">
          <el-option v-for="item in repoOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="题目类型" prop="type" style="width: 250px;">
        <el-select v-model="queryParams.type" placeholder="请选择题目类型" clearable @change="handleQuery">
          <el-option v-for="dict in question_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="难易程度" prop="difficulty" style="width: 250px;">
        <el-select v-model="queryParams.difficulty" placeholder="请选择难易程度" clearable @change="handleQuery">
          <el-option v-for="dict in question_difficulty" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="题目内容" prop="title" style="width: 250px;">
        <el-input v-model="queryParams.title" placeholder="请输入题目内容" clearable @keyup.enter="handleQuery"
          style="width: 200px;" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasRole="['admin', 'teacher']">新增</el-button>
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

    <el-table v-loading="loading" :data="questionList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" align="center" prop="id" width="50" />
      <el-table-column label="题目类型" align="center" prop="type">
        <template #default="scope">
          <dict-tag :options="question_type" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="关联题库" align="center" prop="repoName" />
      <el-table-column label="题目内容" align="center" prop="title" show-overflow-tooltip />
      <el-table-column label="正确答案" align="center" prop="answer" show-overflow-tooltip />
      <el-table-column label="答案解析" align="center" prop="analysis" show-overflow-tooltip />
      <el-table-column label="难易程度" align="center" prop="difficulty">
        <template #default="scope">
          <dict-tag :options="question_difficulty" :value="scope.row.difficulty" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasRole="['admin', 'teacher']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasRole="['admin', 'teacher']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改题目管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="questionRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="关联题库" prop="repoId">
          <el-select v-model="form.repoId" placeholder="请选择关联题库" clearable>
            <el-option v-for="item in repoOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="题目内容" prop="title">
          <el-input v-model="form.title" type="textarea" placeholder="请输入题目内容" />
        </el-form-item>
        <el-form-item label="题目类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择题目类型" @change="handleTypeChange">
            <el-option v-for="dict in question_type" :key="dict.value" :label="dict.label"
              :value="parseInt(dict.value)" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="showOptions" label="题目选项" prop="options">
          <div v-for="(option, index) in form.options" :key="index" class="option-item">
            <el-input v-model="option.value" :placeholder="`选项 ${option.key}`" style="width: 160px;" />
            <el-button type="danger" icon="Delete" text @click="removeOptions(index)"></el-button>
          </div>
          <el-button type="primary" text @click="addOptions">+ 添加选项</el-button>
        </el-form-item>
        <el-form-item label="正确答案" prop="answer">
          <!-- 单选题为单选框 -->
          <template v-if="form.type === 1">
            <el-radio-group v-model="form.answer">
              <el-radio v-for="(option, index) in form.options" :key="index" :value="option.key">
                {{ option.key }}. {{ option.value }}</el-radio>
            </el-radio-group>
          </template>
          <!-- 多选题为复选框 -->
          <template v-else-if="form.type === 2">
            <el-checkbox-group v-model="form.answer">
              <el-checkbox v-for="(option, index) in form.options" :key="index" :value="option.key">
                {{ option.key }}. {{ option.value }}</el-checkbox>
            </el-checkbox-group>
          </template>
          <template v-else-if="form.type === 3">
            <el-radio-group v-model="form.answer">
              <el-radio :value="true">正确</el-radio>
              <el-radio :value="false">错误</el-radio>
            </el-radio-group>
          </template>
          <template v-else>
            <el-input v-model="form.answer" type="textarea" :rows="5" placeholder="请输入正确答案" />
          </template>
        </el-form-item>
        <el-form-item label="答案解析" prop="analysis">
          <el-input v-model="form.analysis" type="textarea" placeholder="请输入答案解析" />
        </el-form-item>
        <el-form-item label="难易程度" prop="difficulty">
          <el-select v-model="form.difficulty" placeholder="请选择难易程度">
            <el-option v-for="dict in question_difficulty" :key="dict.value" :label="dict.label" :value="parseInt(dict.value)" />
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
  </div>
</template>

<script setup name="Question">
import { listQuestion, getQuestion, delQuestion, addQuestion, updateQuestion } from "@/api/manage/question";
import { listRepo } from '@/api/manage/repo';
import { loadAllParams } from '@/api/page';
import { computed } from "vue";

const { proxy } = getCurrentInstance();
const { question_type } = proxy.useDict('question_type');
const { question_difficulty } = proxy.useDict('question_difficulty');

const questionList = ref([]);
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
    title: null,
    type: null,
    repoId: null,
    difficulty: null
  },
  rules: {
    title: [
      { required: true, message: "题目内容不能为空", trigger: "blur" }
    ],
    type: [
      { required: true, message: "题目类型不能为空", trigger: "change" }
    ],
    answer: [
      { required: true, message: "正确答案不能为空", trigger: "change" }
    ],
    difficulty: [
      { required: true, message: "难易程度不能为空", trigger: "change" }
    ],
    repoId: [
      { required: true, message: "关联题库不能为空", trigger: "change" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

const repoOptions = ref([]);

const showOptions = computed(() => {
  return [1, 2].includes(parseInt(form.value.type))
})
/** 查询题目管理列表 */
function getList() {
  loading.value = true;
  listQuestion(queryParams.value).then(response => {
    questionList.value = response.rows;
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
    title: null,
    type: null,
    options: [],
    answer: [],
    analysis: null,
    repoId: null,
    difficulty: null
  };
  proxy.resetForm("questionRef");
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
  title.value = "添加题目管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getQuestion(_id).then(response => {
    form.value = response.data;
    form.value.options = JSON.parse(form.value.options);
    form.value.type = parseInt(form.value.type)
    form.value.answer = form.value.type === 2 ? JSON.parse(form.value.answer) : JSON.parse(form.value.answer)[0];

    open.value = true;
    title.value = "修改题目管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["questionRef"].validate(valid => {
    if (valid) {
      const params = { ...form.value }
      params.options = JSON.stringify(form.value.options)
      params.answer = JSON.stringify(form.value.type === 2 ? form.value.answer : [form.value.answer])
      if (form.value.id != null) {
        updateQuestion(params).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addQuestion(params).then(response => {
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
  proxy.$modal.confirm('是否确认删除题目管理编号为"' + _ids + '"的数据项？').then(function () {
    return delQuestion(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/question/export', {
    ...queryParams.value
  }, `question_${new Date().getTime()}.xlsx`)
}

function getRepoList() {
  listRepo(loadAllParams).then(res => {
    repoOptions.value = res.rows
  })
}

// 添加选项
function addOptions() {
  const newKey = String.fromCharCode(65 + form.value.options.length) // 自动生成A B C...
  console.log(newKey)
  form.value.options.push({ key: newKey, value: '' })
}

// 删除选项
function removeOptions(index) {
  form.value.options.splice(index, 1)
}

// 题目类型改变
function handleTypeChange() {
  // 清除选项选中
  if (form.value.type === 2) {
    form.value.answer = []
  } else {
    form.value.answer = ''
  }
}

getList();
getRepoList();
</script>
