<template>
    <div class="app-container">
        <!-- 顶部试卷信息 -->
        <div class="paper-header">
            <el-form :model="paperInfo" label-width="80px" class="header-form">
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form-item label="试卷标题">
                            <el-input v-model="paperInfo.title" disabled />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="总分">
                            <el-input v-model="paperInfo.totalScore" disabled />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="考试时长">
                            <el-input v-model="paperInfo.duration" disabled />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <div class="action-buttons">
                <el-button type="primary" @click="handleAutoCompose">自动组卷</el-button>
                <el-button type="success" @click="handleCompleteCompose">完成组卷</el-button>
            </div>
        </div>

        <el-row :gutter="20" class="content">
            <!-- 左侧题库 -->
            <el-col :span="8" class="question-bank">
                <div class="section-header">
                    <el-form :model="filterParams" ref="filterRef" :inline="true">
                        <el-form-item prop="courseId">
                            <el-select v-model="filterParams.courseId" placeholder="请选择课程" @change="filterQuestions" clearable style="width: 150px;">
                                <el-option v-for="course in courseList" :key="course.id" :label="course.name" :value="course.id" />
                            </el-select>
                        </el-form-item>
                        <el-form-item prop="type">
                            <el-select v-model="filterParams.type" placeholder="请选择题库类型" @change="filterQuestions" clearable style="width: 150px;">
                                <el-option v-for="dict in question_type" :key="dict.value" :label="dict.label" :value="dict.value" />
                            </el-select>
                        </el-form-item>
                        <el-form-item prop="difficulty">
                            <el-select v-model="filterParams.difficulty" placeholder="请选择难易程度" @change="filterQuestions" clearable style="width: 150px;">
                                <el-option v-for="dict in question_difficulty" :key="dict.value" :label="dict.label" :value="dict.value" />
                            </el-select>
                        </el-form-item>
                    </el-form>
                </div>
                <div class="card-container">
                    <el-card class="question-card" v-for="item in filteredQuestions" :key="item.id" draggable="true"
                        @dragstart="dragStart(item)">
                        <p>{{ item.title }}</p>
                    </el-card>
                </div>
            </el-col>

            <!-- 中间试卷区域 -->
            <el-col :span="16" class="paper-container">
                <div class="paper-content" @dragover.prevent @drop="dropQuestion">
                    <el-card v-for="(question, qIndex) in paperQuestions" :key="qIndex" class="question-item"
                        @mouseover="hoverIndex = qIndex" @mouseleave="hoverIndex = null">
                        <p>{{ question.title }}</p>
                        <div v-if="hoverIndex === qIndex" class="question-actions">
                            <el-button size="mini" type="danger" @click="removeQuestion(qIndex)">
                                删除
                            </el-button>
                        </div>
                    </el-card>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from "vue";
import { getPaper } from "@/api/manage/paper";
import { listQuestion } from "@/api/manage/question";
import { listCourse } from '@/api/manage/course'
import { loadAllParams } from '@/api/page';
import { addPaperQuestion, getPaperQuestions } from "@/api/manage/paper";

const { proxy } = getCurrentInstance();
const { question_type } = proxy.useDict('question_type');
const { question_difficulty } = proxy.useDict('question_difficulty');


const route = useRoute();

const hoverIndex = ref(null);

// 试卷信息
const paperInfo = ref({});
function getPaperInfo() {
    getPaper(route.params.paperId).then((res) => {
        paperInfo.value = res.data;
    });
}
getPaperInfo();

function getPaperQuestionList() {
    getPaperQuestions(route.params.paperId).then(res => {
        paperQuestions.value = res.data
    })
}
getPaperQuestionList()

// 课程列表
const courseList = ref([])
function getCourseList() {
    listCourse(loadAllParams).then(res => {
        courseList.value = res.rows
    })
}
getCourseList()

// 按课程过滤
const filterParams = ref({
    courseId: null,
    type: null, // 题目类型
    difficulty: null, // 难易程度
})
const filteredQuestions = ref([]); // 过滤后的题目列表
// 总题库
const questionList = ref([]);
function getQuestionBank() {
    listQuestion(loadAllParams).then(res => {
        questionList.value = res.rows
        filteredQuestions.value = res.rows;
    })
}
// 题库筛选
function filterQuestions() {
    filteredQuestions.value = questionList.value.filter(item => {
        return (
            (!filterParams.value.courseId || item.courseId === filterParams.value.courseId) &&
            (!filterParams.value.type || item.type == filterParams.value.type) &&
            (!filterParams.value.difficulty || item.difficulty == filterParams.value.difficulty)
        );
    });
}
getQuestionBank()

// 试卷题目
const paperQuestions = ref([]);
// 题目顺序
const questionIndex = computed(() => paperQuestions.value.length + 1);

// 拖拽题目
let draggedItem = null;
function dragStart(item) {
    draggedItem = item;
}   

// 处理拖拽放置
function dropQuestion() {
    if (draggedItem) {
        const item = {
            ...draggedItem,
            paperId: route.params.paperId,
            questionId: draggedItem.id,
            score: 5,
            orderNum: questionIndex.value++
        }
        paperQuestions.value.push(item);
        draggedItem = null;
    }
}

// 删除试卷中的题目
function removeQuestion(questionIndex) {
    questionIndex.value--;
    paperQuestions.value.splice(questionIndex, 1);
}

// 自动组卷
function handleAutoCompose() {
    paperQuestions.value.length = 0; // 清空之前的试卷
    const items = questionList.value.splice(0, 4).map(v => {
        return {
            ...v,
            paperId: route.params.paperId,
            questionId: v.id,
            score: 5,
            orderNum: questionIndex.value++
        }
    });
    paperQuestions.value.push(...items); // 自动选择前4道题
}

// 完成组卷
function handleCompleteCompose() {
    addPaperQuestion(paperQuestions.value).then(res => {
        proxy.$message({
            message: '试卷组卷成功',
            type: 'success'
        });
        proxy.$router.push({ path: '/question_bank/paper' });
    })
}

</script>

<style scoped>
.app-container {
    display: flex;
    flex-direction: column;
    padding: 20px;
}

.paper-header {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.header-form {
    flex: 1;
}

.action-buttons {
    display: flex;
    gap: 10px;
}

.content {
    display: flex;
    height: 84vh;
}

.question-bank,
.paper-container {
    border: 1px solid #ebeef5;
    border-radius: 5px;
    padding: 10px;
    height: 84vh;
}

.card-container {
    overflow-y: auto;
    max-height: 85%;
}

.question-card,
.question-item {
    margin-bottom: 10px;
}

.question-actions {
    text-align: right;
}

.paper-content {
    min-height: 200px;
    border: 2px dashed #d9d9d9;
    padding: 10px;
    border-radius: 5px;
}
</style>