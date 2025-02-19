<template>
    <div class="app-container">
        <el-row :gutter="24">
            <el-col :span="24" style="margin-bottom: 20px">
                <el-alert title="点击`开始考试`后将自动进入考试，请诚信考试！" type="error" effect="dark" style="margin-bottom: 10px" />
                <el-card class="pre-exam">
                    <div><strong>考试名称：</strong>{{ examInfo.name }}</div>
                    <div><strong>考试时长：</strong>{{ examInfo.duration }}分钟</div>
                    <div><strong>试卷总分：</strong>{{ examInfo.totalScore }}分</div>
                    <div><strong>及格分数：</strong>{{ examInfo.passScore }}分</div>
                    <div><strong>是否限时：</strong>{{ examInfo.limited === 1 ? '是' : '否' }}</div>
                    <div v-if="examInfo.limited === 1">
                        <strong>考试时间：</strong>
                        {{ examInfo.startTime }} - {{ examInfo.endTime }}
                    </div>
                </el-card>
            </el-col>
            <el-col :span="24">
                <el-button :loading="loading" type="primary" icon="CaretRight" @click="handleStart">
                    开始考试
                </el-button>
                <el-button @click="handleBack">
                    返回
                </el-button>
            </el-col>
        </el-row>
    </div>
</template>

<script setup name="UserExamPrepare">
import { getExamInfo } from "@/api/user/exam"

const { proxy } = getCurrentInstance();

const route = useRoute()
const router = useRouter()

const examInfo = ref({})
const loading = ref(false)

function getData() {
    getExamInfo(route.params.examId).then(res => {
        examInfo.value = res.data
    })
}

// 开始考试
function handleStart() {
    loading.value = true
    
}

// 返回
function handleBack() {
    router.push({ name: 'UserExam' })
}

getData()
</script>