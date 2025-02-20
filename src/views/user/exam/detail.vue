<template>
    <div class="app-container">
        <el-row>
            <el-col :span="24">
                <el-card class="exam-detail">
                    <ExamCountDown v-model:modelValue="paperData.leftSeconds" @timeout="doHandler" />
                    <div>
                        <el-button :loading="loading" type="primary" icon="Plus" @click="handleSubmit">
                            {{ handleText }}
                        </el-button>
                    </div>
                </el-card>
            </el-col>
        </el-row>
        <el-row class="card-container" :gutter="20">
            <el-col :span="5">
                <el-card>
                    <p class="card-title">答题卡</p>
                    <el-row class="card-line">
                        <el-tag type="info">未作答</el-tag>
                        <el-tag type="success">已作答</el-tag>
                    </el-row>

                    <div
                        v-if="paperData.singleChoiceQuestionList !== undefined && paperData.singleChoiceQuestionList.length > 0">
                        <p class="card-title">单选题</p>
                        <el-row class="card-line">
                            <el-tag v-for="item in paperData.singleChoiceQuestionList" :key="item.id"
                                :type="cardItemClass(item.id, item.answered)" @click="saveAnswer(item)">
                                {{ item.orderNum }}
                            </el-tag>
                        </el-row>
                    </div>
                    <div
                        v-if="paperData.multipleChoiceQuestionList !== undefined && paperData.multipleChoiceQuestionList.length > 0">
                        <p class="card-title">多选题</p>
                        <el-row class="card-line">
                            <el-tag v-for="item in paperData.multipleChoiceQuestionList" :key="item.id"
                                :type="cardItemClass(item.id, item.answered)" @click="saveAnswer(item)">
                                {{ item.orderNum }}
                            </el-tag>
                        </el-row>
                    </div>
                    <div v-if="paperData.judgeQuestionList !== undefined && paperData.judgeQuestionList.length > 0">
                        <p class="card-title">判断题</p>
                        <el-row class="card-line">
                            <el-tag v-for="item in paperData.judgeQuestionList" :key="item.id"
                                :type="cardItemClass(item.id, item.answered)" @click="saveAnswer(item)">
                                {{ item.orderNum }}
                            </el-tag>
                        </el-row>
                    </div>
                    <div v-if="paperData.fillQuestionList !== undefined && paperData.fillQuestionList.length > 0">
                        <p class="card-title">填空题</p>
                        <el-row class="card-line">
                            <el-tag v-for="item in paperData.fillQuestionList" :key="item.id"
                                :type="cardItemClass(item.id, item.answered)" @click="saveAnswer(item)">
                                {{ item.orderNum }}
                            </el-tag>
                        </el-row>
                    </div>
                    <div
                        v-if="paperData.shortAnswerQuestionList !== undefined && paperData.shortAnswerQuestionList.length > 0">
                        <p class="card-title">简答题</p>
                        <el-row class="card-line">
                            <el-tag v-for="item in paperData.shortAnswerQuestionList" :key="item.id"
                                :type="cardItemClass(item.id, item.answered)" @click="saveAnswer(item)">
                                {{ item.orderNum }}
                            </el-tag>
                        </el-row>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="19">
                <el-card class="question-card">
                    <p v-if="questionData.title">{{ questionData.orderNum }}. {{ questionData.title }}</p>
                    <!-- 单选题选项 -->
                    <template v-if="questionData.type === 1">
                        <el-radio-group v-model="radioValue">
                            <el-radio v-for="(option, optionIndex) in questionData.options" :key="optionIndex"
                                :value="option.key">
                                {{ option.key }}. {{ option.value }}
                            </el-radio>
                        </el-radio-group>
                    </template>
                    <!-- 多选题选项 -->
                    <template v-else-if="questionData.type === 2">
                        <el-checkbox-group v-model="checkboxValue">
                            <el-checkbox v-for="(option, optionIndex) in questionData.options" :key="optionIndex"
                                :label="option.key">
                                {{ option.key }}. {{ option.value }}
                            </el-checkbox>
                        </el-checkbox-group>
                    </template>
                    <!-- 判断题选项 -->
                    <template v-else-if="questionData.type === 3">
                        <el-radio-group v-model="radioValue">
                            <el-radio :value="true">正确</el-radio>
                            <el-radio :value="false">错误</el-radio>
                        </el-radio-group>
                    </template>
                    <!-- 填空题 / 简答题 -->
                    <template v-else>
                        <el-input v-model="inputValue" placeholder="请输入答案"></el-input>
                    </template>
                    <div class="exam-detail-btn">
                        <el-button v-if="showPrevious" type="primary" icon="Back"
                            @click="handPreQuestion()">上一题</el-button>
                        <el-button v-if="showNext" type="warning" icon="Right"
                            @click="handNextQuestion()">下一题</el-button>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>
<script setup name="UserExamDetail">
import ExamCountDown from './components/ExamCountDown.vue';
import { getExamRecordDetail, fillAnswer } from '@/api/user/exam';

const { proxy } = getCurrentInstance()

const route = useRoute();
const router = useRouter();

// 试卷数据
const paperData = ref({});
// 所有题目数据
const allQuestionData = ref([])
// 当前题目数据
const questionData = ref({});
// 已做题目数据
const examAnswerList = ref({});
// 交卷按钮
const handleText = ref('交卷');
// 交卷按钮loading
const loading = ref(false)
// 显示下一题
const showNext = ref(true);
// 显示上一题
const showPrevious = ref(false)
// 单选 / 判断选项
const radioValue = ref('')
// 多选选项
const checkboxValue = ref([])
// 填空 / 简答题文字
const inputValue = ref('')

// 获取数据
function getData() {
    getExamRecordDetail(route.params.id).then(res => {
        paperData.value = res.data
        // 已做题目列表
        examAnswerList.value = paperData.value.examAnswerList

        // 解析题目选项数据 并判断是否已作答 并保存到allQuestionData中
        paperData.value.singleChoiceQuestionList.forEach(item => {
            item.options = JSON.parse(item.options)
            item.answered = isAnswered(item.id)
            allQuestionData.value.push(item)
        })
        paperData.value.multipleChoiceQuestionList.forEach(item => {
            item.options = JSON.parse(item.options)
            item.answered = isAnswered(item.id)
            allQuestionData.value.push(item)
        })
        paperData.value.judgeQuestionList.forEach(item => {
            item.answered = isAnswered(item.id)
            allQuestionData.value.push(item)
        })
        paperData.value.fillQuestionList.forEach(item => {
            item.answered = isAnswered(item.id)
            allQuestionData.value.push(item)
        })
        paperData.value.shortAnswerQuestionList.forEach(item => {
            item.answered = isAnswered(item.id)
            allQuestionData.value.push(item)
        })

        // 设置当前题目为首题
        questionData.value = allQuestionData.value[0]
    })
}

// 判断题目是否已做
function isAnswered(questionId) {
    return examAnswerList.value.some(item => item.questionId === questionId)
}

// 答题卡样式
function cardItemClass(questionId, answered) {
    // 当前答题卡样式
    if (questionId === questionData.value.id) {
        return 'warning'
    }
    // 已做答题卡样式
    return answered ? 'success' : 'info'
}

// 统计未做题目数量
function countUnAnswered() {
    let count = 0
    allQuestionData.value.forEach(item => {
        if (!item.answered) {
            count++
        }
    })
    return count
}

// 下一题
function handNextQuestion() {
    const index = questionData.value.orderNum
    // 保存答案
    saveAnswer(allQuestionData.value[index])
}

// 上一题
function handPreQuestion() {
    const index = questionData.value.orderNum - 2
    // 保存答案
    saveAnswer(allQuestionData.value[index])
}

// 保存答案
function saveAnswer(item, callback) {
    if (item.id === allQuestionData.value[0].id) {
        showPrevious.value = false
    } else {
        showPrevious.value = true
    }

    if (item.id === allQuestionData.value[allQuestionData.value.length - 1].id) {
        showNext.value = false
    } else {
        showNext.value = true
    }

    // 暂存当前题目答案
    // 暂存当前题目答案
    const answers = [];
    if (radioValue.value !== '') {
        answers.push(radioValue.value);
    } else if (checkboxValue.value.length > 0) {
        answers.push(...checkboxValue.value);
    } else if (inputValue.value !== '') {
        answers.push(inputValue.value);
    }


    // 判断是否有答案
    if (answers.length > 0) {
        const data = {
            recordId: route.params.id,
            questionId: questionData.value.id,
            answer: JSON.stringify(answers)
        }

        // 如果切换的是同一个题目，则不发起请求
        if (questionData.value.id !== item.id) {
            const existingAnswerIndex = examAnswerList.value.findIndex(item => item.questionId === questionData.value.id);
            if (existingAnswerIndex !== -1) {
                // 修改已存在的答案
                examAnswerList.value[existingAnswerIndex].answer = data.answer;
            } else {
                // 插入新的答案
                examAnswerList.value.push(data);
            }

            fillAnswer(data).then(() => {
                questionData.value.answered = true;
                // 切换题目
                questionData.value = item;
            });
        }
    } else {
        // 切换题目
        if (questionData.value.id !== item.id) {
            questionData.value = item
        }
    }

    if (callback) {
        callback()
    }

    // 清空选项数据
    if (questionData.value.id !== item.id) {
        radioValue.value = ''
        checkboxValue.value = []
        inputValue.value = ''
    }
}

// 交卷
function handleSubmit() {
    // 保存当前题目答案
    saveAnswer(questionData.value, () => {
        const unAnswered = countUnAnswered()

        if (unAnswered > 0) {
            proxy.$modal.confirm("您还有" + unAnswered + "道题目未作答，是否确认交卷？").then(() => {
                doHandler()
            })
        }
    })
}

function doHandler() {
    handleText.value = "正在交卷，请等待..."
    loading.value = true

    // 交卷请求
    router.push({ name: 'UserExamResult', params: { id: route.params.id } })
}

// 监测questionData.value.id变化
watch(() => questionData.value.id, (newValue, oldValue) => {
    if (newValue !== oldValue) {
        // 设置当前题目答案
        if (isAnswered(questionData.value.id)) {
            const answer = examAnswerList.value.find(item => item.questionId === questionData.value.id)
            if (questionData.value.type === 1 || questionData.value.type === 3) {
                radioValue.value = JSON.parse(answer.answer)[0]
            } else if (questionData.value.type === 2) {
                checkboxValue.value = JSON.parse(answer.answer)
            } else if (questionData.value.type === 4 || questionData.value.type === 5) {
                inputValue.value = JSON.parse(answer.answer)[0]
            }
        }
    }
})
getData()
</script>
<style lang="scss" scoped>
.app-container {
    background-color: #f2f2f2;
    height: 100vh;
}

.exam-detail {
    :deep(.el-card__body) {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
}

.card-container {
    margin-top: 20px;
    height: calc(100vh - 110px);
    overflow-y: auto;

    .card-title {
        background-color: #eee;
        line-height: 35px;
        text-align: center;
        font-size: 14px;
    }

    .card-line {
        padding-left: 10px;

        span {
            cursor: pointer;
            margin: 2px;
        }
    }

    .question-card {
        line-height: 30px;
        width: 100%;

        .el-radio-group label,
        .el-checkbox-group label {
            width: 100%;
        }

        .el-radio,
        .el-checkbox {
            border: 1px solid #e6e6e6;
            padding: 9px 20px 9px 10px;
            border-radius: 4px;
            margin-bottom: 10px;
            width: 100%;
            margin-right: 0;
            height: fit-content;
        }

        :deep(.el-checkbox__label) {
            white-space: break-spaces;
            line-height: 20px;
        }

        .exam-detail-btn {
            margin-top: 20px;
        }
    }
}
</style>