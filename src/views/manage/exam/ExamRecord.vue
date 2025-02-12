<template>
    <div class="app-container">
        <h2 class="text-center">{{ paperData.examName }}</h2>
        <p class="text-center" style="color: #666;">{{ paperData.startTime }}</p>

        <el-row style="margin-top: 20px;">
            <el-col :span="6" class="text-center">
                考生学号：{{ paperData.userName }}
            </el-col>
            <el-col :span="6" class="text-center">
                考生姓名：{{ paperData.nickName }}
            </el-col>
            <el-col :span="6" class="text-center">
                考试用时：{{ paperData.duration }}
            </el-col>
            <el-col :span="6" class="text-center">
                考试得分：{{ paperData.score }}
            </el-col>
        </el-row>
        <el-card style="margin-top: 20px">
            <div v-for="(item, index) in questionMap" :key="index">
                <div v-for="(question, questionIndex) in item" :key="questionIndex" class="question-item">
                    <el-row :gutter="10" class="mt10">
                        <el-col :span="20">
                            <span>
                                {{ question.orderNum }}. {{ question.title }}
                                （得分：{{ question.score }}）
                            </span>
                        </el-col>
                    </el-row>
                    <!-- 单选题 -->
                    <template v-if="question.type === 1">
                        <el-radio-group v-model="question.answer" class="options-group">
                            <el-radio v-for="(option, optionIndex) in question.options" :key="optionIndex"
                                :value="option.key" class="options" @click.prevent>
                                {{ option.key }}. {{ option.value }}
                            </el-radio>
                        </el-radio-group>
                    </template>
                    <!-- 多选题 -->
                    <template v-else-if="question.type === 2">
                        <el-checkbox-group v-model="question.answer" class="options-group">
                            <el-checkbox v-for="(option, optionIndex) in question.options" :key="optionIndex"
                                :value="option.key" class="options" @click.prevent>
                                {{ option.key }}. {{ option.value }}
                            </el-checkbox>
                        </el-checkbox-group>
                    </template>
                    <!-- 判断题 -->
                    <template v-else-if="question.type === 3">
                        <el-radio-group v-model="question.answer">
                            <el-radio :value="true"  class="options" @click.prevent>正确</el-radio>
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
                                <el-input v-model="question.answer" placeholder="请输入答案" class="options" readonly></el-input>
                            </el-col>
                        </el-row>
                    </template>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup name="ExamRecord">
import { listPaperQuestion } from '@/api/manage/paper';
import { getRecord } from '@/api/manage/examRecord';
import { listExamAnswer } from "@/api/manage/examAnswer";
import { formatSeconds } from "@/utils/index";

const { proxy } = getCurrentInstance();

const route = useRoute();

const questionMap = ref({});
const examAnswerList = ref([])
const paperData = ref({})

function getList() {
    getRecord(route.params.id).then(res1 => {
        paperData.value = res1.data
        paperData.value.duration = formatSeconds(paperData.value.duration)
        listPaperQuestion(res1.data.paperId).then(res2 => {
            questionMap.value = res2.data
            Object.keys(questionMap.value).forEach(key => {
                questionMap.value[key].forEach(item => {
                    item.options = JSON.parse(item.options)
                    item.type = parseInt(item.type)
                    item.answer = getOptionValue(item)
                })
            })
        })
        const params = {
            recordId: route.params.id
        }
        listExamAnswer(params).then(res => {
            examAnswerList.value = res.rows
        })
    })
}

function getOptionValue(question) {
    const answer = examAnswerList.value.find(item => item.questionId === question.id)
    return answer ? question.type === 2 ? JSON.parse(answer.answer) : JSON.parse(answer.answer)[0] : question.type === 2 ? [] : ''
}
getList()
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