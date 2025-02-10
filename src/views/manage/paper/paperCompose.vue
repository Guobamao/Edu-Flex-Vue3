<template>
    <div class="app-container">
        <h3>组卷信息</h3>
        <el-card>
            <el-row :gutter="10" class="mb8" justify="space-between">
                <el-col :span="1.5">
                    <el-button type="primary" icon="Plus" @click="handleRepoAdd">添加题库</el-button>
                </el-col>
                <el-col :span="4">
                    <span>试卷总分：{{ totalScore }}</span>
                </el-col>
            </el-row>
            <el-table :data="repoList" empty-text="请点击上面的`添加题库`进行设置">
                <el-table-column label="题库名称" width="200">
                    <template #default="scope">
                        <RepoSelect v-model="scope.row.repoId" :excludes="excludes"></RepoSelect>
                    </template>
                </el-table-column>
                <el-table-column label="单选题数量" align="center" width="150">
                    <template #default="scope">
                        <el-input-number v-model="scope.row.singleChoiceCount" :min="0" :max="10" :controls="false"
                            style="width: 50px;" />
                        /
                        16
                    </template>
                </el-table-column>
                <el-table-column label="分值" align="center">
                    <template #default="scope">
                        <el-input-number v-model="scope.row.singleChoiceScore" :min="0" :max="10" :controls="false"
                            style="width: 50px;" />
                    </template>
                </el-table-column>
                <el-table-column label="多选题数量" align="center" width="150">
                    <template #default="scope">
                        <el-input-number v-model="scope.row.multipleChoiceCount" :min="0" :max="10" :controls="false"
                            style="width: 50px;" />
                        /
                        16
                    </template>
                </el-table-column>
                <el-table-column label="分值" align="center">
                    <template #default="scope">
                        <el-input-number v-model="scope.row.multipleChoiceScore" :min="0" :max="10" :controls="false"
                            style="width: 50px;" />
                    </template>
                </el-table-column>
                <el-table-column label="判断题数量" align="center" width="150">
                    <template #default="scope">
                        <el-input-number v-model="scope.row.judgeCount" :min="0" :max="10" :controls="false"
                            style="width: 50px;" />
                        /
                        16
                    </template>
                </el-table-column>
                <el-table-column label="分值" align="center">
                    <template #default="scope">
                        <el-input-number v-model="scope.row.judgeScore" :min="0" :max="10" :controls="false"
                            style="width: 50px;" />
                    </template>
                </el-table-column>
                <el-table-column label="填空题数量" align="center" width="150">
                    <template #default="scope">
                        <el-input-number v-model="scope.row.blankCount" :min="0" :max="10" :controls="false"
                            style="width: 50px;" />
                        /
                        16
                    </template>
                </el-table-column>
                <el-table-column label="分值" align="center">
                    <template #default="scope">
                        <el-input-number v-model="scope.row.blankScore" :min="0" :max="10" :controls="false"
                            style="width: 50px;" />
                    </template>
                </el-table-column>
                <el-table-column label="简答题数量" align="center" width="150">
                    <template #default="scope">
                        <el-input-number v-model="scope.row.shortAnswerCount" :min="0" :max="10" :controls="false"
                            style="width: 50px;" />
                        /
                        16
                    </template>
                </el-table-column>
                <el-table-column label="分值" align="center">
                    <template #default="scope">
                        <el-input-number v-model="scope.row.shortAnswerScore" :min="0" :max="10" :controls="false"
                            style="width: 50px;" />
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                    <template #default="scope">
                        <el-button type="danger" link icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <h3>试题信息</h3>
        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" icon="Connection" @click="autoCompose"
                    v-if="repoList.length > 0">自动组卷</el-button>
            </el-col>
        </el-row>
        <el-card>
            <div v-for="(item, index) in questionMap" :key="index">
                <div v-if="item.length > 0">
                    <h4>{{ getQuestionType(index) }}</h4>
                    <el-card v-for="(question, questionIndex) in item" :key="questionIndex">
                        <p>{{ questionIndex + 1 }}. {{ question.title }}</p>
                        <!-- 单选题 -->
                        <template v-if="question.type === 1">
                            <el-radio-group v-model="question.answer">
                                <el-radio v-for="(option, optionIndex) in question.options" :key="optionIndex"
                                    :value="option.key">

                                </el-radio>
                            </el-radio-group>
                        </template>
                        <!-- 多选题 -->
                        <template v-else-if="question.type === 2">
                            <el-checkbox-group v-model="question.answer">
                                <el-checkbox v-for="(option, optionIndex) in question.options" :key="optionIndex" :value="option.key">
                                    {{ option.key }}. {{ option.value }}
                                </el-checkbox>
                            </el-checkbox-group>
                        </template>
                    </el-card>
                </div>
            </div>
        </el-card>

    </div>
</template>

<script setup>
import { loadAllParams } from '@/api/page';
import { listRepo } from '@/api/manage/repo';
import { composePaper, listPaperRepo } from '@/api/manage/paper';
import RepoSelect from './components/RepoSelect.vue';

const { proxy } = getCurrentInstance();

const { question_type } = proxy.useDict("question_type");

const route = useRoute();

const repoList = ref([]);
const repoOptions = ref([]);

const excludes = ref([]); // 排除的题库ID
const totalScore = ref(0); // 试卷总分

const questionMap = ref({});

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
        shortAnswerScore: 0
    })
}

function handleDelete(row) {
    const index = repoList.value.indexOf(row);
    repoList.value.splice(index, 1);
}

function getRepoList() {
    listRepo(loadAllParams).then(res => {
        repoOptions.value = res.rows
    })
}

// 获取试卷关联题库列表
function getPaperRepo() {
    listPaperRepo(route.params.paperId).then(res => {
        repoList.value = res.data
    })
}

// 自动组卷
function autoCompose() {
    const data = {
        id: route.params.paperId,
        repoInfos: repoList.value
    }
    composePaper(data).then(res => {
        questionMap.value = res.data
        Object.keys(questionMap.value).forEach(key => {
            questionMap.value[key].forEach(item => {
                item.options = JSON.parse(item.options)
                item.type = parseInt(item.type)
                item.answer = item.type === 2 ? JSON.parse(item.answer) : JSON.parse(item.answer)[0]
            })
        })
        proxy.$modal.msgSuccess("自动组卷成功")
    })
}

// 获取题目类型
function getQuestionType(value) {
    const item = question_type.value.find(item => item.value === value)
    return item.label
}

watch(() => repoList.value, (val) => {
    totalScore.value = 0
    excludes.value = []
    val.forEach(item => {
        totalScore.value += item.singleChoiceCount * item.singleChoiceScore
        totalScore.value += item.multipleChoiceCount * item.multipleChoiceScore
        totalScore.value += item.judgeCount * item.judgeScore
        totalScore.value += item.blankCount * item.blankScore
        totalScore.value += item.shortAnswerCount * item.shortAnswerScore
    })
}, {
    immediate: true,
    deep: true
})

getRepoList()
getPaperRepo()

</script>

<style scoped>
.app-container {
    display: flex;
    flex-direction: column;
    padding: 20px;
}
</style>