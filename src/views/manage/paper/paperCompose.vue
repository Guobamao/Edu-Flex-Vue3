<template>
  <div class="app-container">
    <h3>组卷信息</h3>
    <el-card>
      <el-row :gutter="10" class="mb8" justify="space-between">
        <el-col :span="1.5">
          <el-button type="primary" icon="Plus" @click="handleRepoAdd">添加题库</el-button>
          <el-button type="success" icon="Check" @click="handleRepoSave">保存题库配置</el-button>
        </el-col>
        <el-col :span="4">
          <span>试卷总分：{{ totalScore }}</span>
        </el-col>
      </el-row>
      <el-table :data="repoList" empty-text="请点击上面的`添加题库`进行设置">
        <el-table-column label="题库名称" width="200">
          <template #default="scope">
            <RepoSelect
              v-model="scope.row.repoId"
              :index="scope.$index"
              :courseId="paperInfo.courseId"
              @change="handleRepoChange"
              @clear="handleRepoClear">
            </RepoSelect>
          </template>
        </el-table-column>
        <el-table-column label="单选题数量" align="center" width="150">
          <template #default="scope">
            <el-input-number
              v-model="scope.row.singleChoiceCount"
              :min="0"
              :max="scope.row.singleChoiceTotal"
              :controls="false"
              :disabled="scope.row.repoId === null"
              @change="handleRepoInfoChange(scope.$index)"
              style="width: 50px" />
            /
            {{ scope.row.singleChoiceTotal }}
          </template>
        </el-table-column>
        <el-table-column label="分值" align="center">
          <template #default="scope">
            <el-input-number
              v-model="scope.row.singleChoiceScore"
              :min="0"
              :max="10"
              :controls="false"
              :disabled="scope.row.repoId === null"
              @change="handleRepoInfoChange(scope.$index)"
              style="width: 50px" />
          </template>
        </el-table-column>
        <el-table-column label="多选题数量" align="center" width="150">
          <template #default="scope">
            <el-input-number
              v-model="scope.row.multipleChoiceCount"
              :min="0"
              :max="scope.row.multipleChoiceTotal"
              :controls="false"
              :disabled="scope.row.repoId === null"
              @change="handleRepoInfoChange(scope.$index)"
              style="width: 50px" />
            /
            {{ scope.row.multipleChoiceTotal }}
          </template>
        </el-table-column>
        <el-table-column label="分值" align="center">
          <template #default="scope">
            <el-input-number
              v-model="scope.row.multipleChoiceScore"
              :min="0"
              :max="10"
              :controls="false"
              :disabled="scope.row.repoId === null"
              @change="handleRepoInfoChange(scope.$index)"
              style="width: 50px" />
          </template>
        </el-table-column>
        <el-table-column label="判断题数量" align="center" width="150">
          <template #default="scope">
            <el-input-number
              v-model="scope.row.judgeCount"
              :min="0"
              :max="scope.row.judgeTotal"
              :controls="false"
              :disabled="scope.row.repoId === null"
              @change="handleRepoInfoChange(scope.$index)"
              style="width: 50px" />
            /
            {{ scope.row.judgeTotal }}
          </template>
        </el-table-column>
        <el-table-column label="分值" align="center">
          <template #default="scope">
            <el-input-number
              v-model="scope.row.judgeScore"
              :min="0"
              :max="10"
              :controls="false"
              :disabled="scope.row.repoId === null"
              @change="handleRepoInfoChange(scope.$index)"
              style="width: 50px" />
          </template>
        </el-table-column>
        <el-table-column label="填空题数量" align="center" width="150">
          <template #default="scope">
            <el-input-number
              v-model="scope.row.blankCount"
              :min="0"
              :max="scope.row.blankTotal"
              :controls="false"
              :disabled="scope.row.repoId === null"
              @change="handleRepoInfoChange(scope.$index)"
              style="width: 50px" />
            /
            {{ scope.row.blankTotal }}
          </template>
        </el-table-column>
        <el-table-column label="分值" align="center">
          <template #default="scope">
            <el-input-number
              v-model="scope.row.blankScore"
              :min="0"
              :max="10"
              :controls="false"
              :disabled="scope.row.repoId === null"
              @change="handleRepoInfoChange(scope.$index)"
              style="width: 50px" />
          </template>
        </el-table-column>
        <el-table-column label="简答题数量" align="center" width="150">
          <template #default="scope">
            <el-input-number
              v-model="scope.row.shortAnswerCount"
              :min="0"
              :max="scope.row.shortAnswerTotal"
              :controls="false"
              :disabled="scope.row.repoId === null"
              @change="handleRepoInfoChange(scope.$index)"
              style="width: 50px" />
            /
            {{ scope.row.shortAnswerTotal }}
          </template>
        </el-table-column>
        <el-table-column label="分值" align="center">
          <template #default="scope">
            <el-input-number
              v-model="scope.row.shortAnswerScore"
              :min="0"
              :max="10"
              :controls="false"
              :disabled="scope.row.repoId === null"
              @change="handleRepoInfoChange(scope.$index)"
              style="width: 50px" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button type="danger" link icon="Delete" @click="handleDelete(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <h3>试题信息</h3>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-tooltip
          :disabled="canGenerate"
          content="请先保存题库配置"
          placement="top"
          effect="light">
          <el-button
            type="primary"
            icon="Connection"
            @click="generateQuestionList"
            v-if="repoList.length > 0"
            :disabled="!canGenerate"
            >自动组卷</el-button
          >
        </el-tooltip>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="Check"
          @click="submitCompose"
          v-if="Object.keys(questionMap).length > 0"
          >提交组卷</el-button
        >
      </el-col>
    </el-row>
    <el-card>
      <template v-if="Object.keys(questionMap).length > 0">
        <div v-for="(item, index) in questionMap" :key="index">
          <div v-for="(question, questionIndex) in item" :key="questionIndex" class="question-item">
            <el-row :gutter="10" class="mt10">
              <el-col :span="1.5">
                <dict-tag :options="question_type" :value="question.type" />
              </el-col>
              <el-col :span="1.5">
                <dict-tag :options="question_difficulty" :value="question.difficulty" />
              </el-col>
              <el-col :span="20">
                <span>{{ question.orderNum }}. {{ question.title }}</span>
              </el-col>
            </el-row>
            <!-- 单选题 -->
            <template v-if="question.type === 1">
              <el-radio-group v-model="question.answer" class="options-group">
                <el-radio
                  v-for="(option, optionIndex) in question.options"
                  :key="optionIndex"
                  :value="option.key"
                  class="options"
                  @click.prevent>
                  {{ option.key }}. {{ option.value }}
                </el-radio>
              </el-radio-group>
            </template>
            <!-- 多选题 -->
            <template v-else-if="question.type === 2">
              <el-checkbox-group v-model="question.answer" class="options-group">
                <el-checkbox
                  v-for="(option, optionIndex) in question.options"
                  :key="optionIndex"
                  :value="option.key"
                  class="options"
                  @click.prevent>
                  {{ option.key }}. {{ option.value }}
                </el-checkbox>
              </el-checkbox-group>
            </template>
            <!-- 判断题 -->
            <template v-else-if="question.type === 3">
              <el-radio-group v-model="question.answer">
                <el-radio :value="true" class="options" @click.prevent>正确</el-radio>
                <el-radio :value="false" class="options" @click.prevent>错误</el-radio>
              </el-radio-group>
            </template>
            <!-- 填空题与简答题 -->
            <template v-else>
              <el-row :gutter="10" class="mt10 mb10">
                <el-col :span="1.5">
                  <span>答案：</span>
                </el-col>
                <el-col :span="12">
                  <el-input
                    v-model="question.answer"
                    placeholder="请输入答案"
                    class="options"
                    readonly></el-input>
                </el-col>
              </el-row>
            </template>
          </div>
        </div>
      </template>
      <el-empty v-else description="暂未关联任何题目" />
    </el-card>
  </div>
</template>

<script setup>
import { loadAllParams } from "@/api/page";
import { listRepo } from "@/api/manage/repo";
import {
  generateQuestion,
  composePaper,
  listPaperRepo,
  listPaperQuestion,
  delPaperRepo,
  savePaperRepo,
  getPaper,
} from "@/api/manage/paper";
import RepoSelect from "./components/RepoSelect.vue";

const { proxy } = getCurrentInstance();

const router = useRouter();

const { question_type } = proxy.useDict("question_type");
const { question_difficulty } = proxy.useDict("question_difficulty");
const route = useRoute();

const paperInfo = ref({}); // 试卷信息
const repoList = ref([]); // 已添加题库列表
const repoOptions = ref([]); // 所有题库

const totalScore = computed(() => {
  return repoList.value.reduce((sum, item) => {
    return (
      sum +
      item.singleChoiceCount * item.singleChoiceScore +
      item.multipleChoiceCount * item.multipleChoiceScore +
      item.judgeCount * item.judgeScore +
      item.blankCount * item.blankScore +
      item.shortAnswerCount * item.shortAnswerScore
    );
  }, 0);
}); // 试卷总分

const questionMap = ref({}); // 题库ID => 题库信息

// 是否可以自动组卷
const canGenerate = computed(() => {
  return repoList.value.length > 0 && repoList.value.every((item) => item.saved === true);
});

function handleRepoAdd() {
  repoList.value.push({
    repoId: null,
    singleChoiceCount: 0,
    singleChoiceScore: 0,
    multipleChoiceCount: 0,
    multipleChoiceScore: 0,
    judgeCount: 0,
    judgeScore: 0,
    blankCount: 0,
    blankScore: 0,
    shortAnswerCount: 0,
    shortAnswerScore: 0,
    saved: false, // 保存状态标记
  });
}

function handleRepoChange(value, index) {
  if (!value) return;

  const repo = repoOptions.value.find((item) => item.id === value);
  const target = repoList.value[index];
  if (!target) return;

  // 先清空所有题目配置字段
  Object.assign(target, {
    singleChoiceCount: 0,
    singleChoiceScore: 0,
    multipleChoiceCount: 0,
    multipleChoiceScore: 0,
    judgeCount: 0,
    judgeScore: 0,
    blankCount: 0,
    blankScore: 0,
    shortAnswerCount: 0,
    shortAnswerScore: 0,
  });

  // 设置最大值
  target.singleChoiceTotal = repo.singleChoiceCount;
  target.multipleChoiceTotal = repo.multipleChoiceCount;
  target.judgeTotal = repo.judgeCount;
  target.blankTotal = repo.blankCount;
  target.shortAnswerTotal = repo.shortAnswerCount;
  target.saved = false;
}

function handleRepoClear(index) {
  const target = repoList.value[index];
  if (!target) return;

  Object.assign(target, {
    repoId: null,
    singleChoiceCount: 0,
    singleChoiceScore: 0,
    singleChoiceTotal: 0,
    multipleChoiceCount: 0,
    multipleChoiceScore: 0,
    multipleChoiceTotal: 0,
    judgeCount: 0,
    judgeScore: 0,
    judgeTotal: 0,
    blankCount: 0,
    blankScore: 0,
    blankTotal: 0,
    shortAnswerCount: 0,
    shortAnswerScore: 0,
    shortAnswerTotal: 0,
    saved: false,
  });
}

function handleDelete(row) {
  const index = repoList.value.indexOf(row);
  repoList.value.splice(index, 1);
  if (row.id) {
    delPaperRepo(row.id).then((res) => {
      proxy.$modal.msgSuccess("删除成功");
    });
  }
}

function handleRepoInfoChange(index) {
  repoList.value[index].saved = false;
}

function getRepoList() {
  const params = {
    ...loadAllParams,
    courseId: paperInfo.value.courseId,
  };
  listRepo(params).then((res) => {
    repoOptions.value = res.rows;
  });
}

// 获取试卷关联题库列表
function getData() {
  // 获取试卷信息
  getPaper(route.params.paperId).then((res) => {
    paperInfo.value = res.data;
  });
  // 获取关联题库列表
  listPaperRepo(route.params.paperId).then((res) => {
    repoList.value = res.data;
  });
  // 获取关联题目列表
  if (repoList.value.length > 0) {
    listPaperQuestion(route.params.paperId).then((res) => {
      questionMap.value = res.data;
      Object.keys(questionMap.value).forEach((key) => {
        questionMap.value[key].forEach((item) => {
          item.options = JSON.parse(item.options);
          item.type = parseInt(item.type);
          item.answer = item.type === 2 ? JSON.parse(item.answer) : JSON.parse(item.answer)[0];
        });
      });
    });
  }
}

// 保存题库配置
function handleRepoSave() {
  const data = {
    paperId: route.params.paperId,
    repoInfos: repoList.value,
  };
  savePaperRepo(data).then((res) => {
    repoList.value.forEach((item) => {
      item.saved = true;
    });
    proxy.$modal.msgSuccess("保存成功");
  });
}

function validateRepoSettings() {
  for (const repo of repoList.value) {
    if (!repo.repoId) return proxy.$modal.msgError("请先选择题库");
    if (
      repo.singleChoiceCount * repo.singleChoiceScore === 0 &&
      repo.multipleChoiceCount * repo.multipleChoiceScore === 0 &&
      repo.judgeCount * repo.judgeScore === 0 &&
      repo.blankCount * repo.blankScore === 0 &&
      repo.shortAnswerCount * repo.shortAnswerScore === 0
    ) {
      return proxy.$modal.msgError("每个题库至少要配置一道题");
    }
  }
  return true;
}

// 自动组卷
function generateQuestionList() {
  if (!validateRepoSettings()) return;
  const data = {
    paperId: route.params.paperId,
    repoInfos: repoList.value,
  };
  generateQuestion(data).then((res) => {
    questionMap.value = res.data;
    Object.keys(questionMap.value).forEach((key) => {
      questionMap.value[key].forEach((item) => {
        item.options = JSON.parse(item.options);
        item.type = parseInt(item.type);
        item.answer = item.type === 2 ? JSON.parse(item.answer) : JSON.parse(item.answer)[0];
      });
    });
    proxy.$modal.msgSuccess("自动组卷成功");
  });
}

// 提交组卷
function submitCompose() {
  const data = {
    id: route.params.paperId,
    questionMap: Object.keys(questionMap.value).reduce((pre, cur) => {
      pre[cur] = questionMap.value[cur].map((item) => item.id);
      return pre;
    }, {}),
  };
  composePaper(data).then((res) => {
    proxy.$modal.msgSuccess("组卷成功");
    router.push("/admin/exams/paper");
  });
}

getRepoList();
getData();
</script>

<style lang="scss" scoped>
.app-container {
  display: flex;
  flex-direction: column;
  padding: 20px;

  .question-item {
    border-bottom: 1px solid #d8d8d8;
  }

  .options-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    .options {
      display: inline-flex;
      max-width: 50%;
      height: fit-content;
      margin: 8px 0;

      :deep(.el-radio__label) {
        white-space: break-spaces;
        line-height: 20px;
      }

      :deep(.el-checkbox__label) {
        white-space: break-spaces;
        line-height: 20px;
      }
    }
  }
}
</style>
