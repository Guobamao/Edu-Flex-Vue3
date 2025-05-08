<template>
    <div class="app-container">
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/course' }">全部课程</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/course/' + courseInfo.id }">{{ courseInfo.name }}</el-breadcrumb-item>
            <el-breadcrumb-item>作业：{{ homeworkInfo.title }}</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card class="homework-info-card">
            <div class="header">
                <div class="title">
                    <span class="label">作业：</span>
                    <span class="value">{{ homeworkInfo.title }}</span>
                </div>
            </div>
            <div class="body">
                <div class="content">
                    <span class="label">作业内容：</span>
                    <span class="value" v-html="homeworkInfo.content"></span>
                </div>
                <div class="content">
                    <span class="label">当前提交状态：</span>
                    <span class="value">{{ homeworkInfo.statusLabel }}</span>
                    <span class="label" v-if="homeworkInfo.submitTime">提交时间：</span>
                    <span class="value">{{ homeworkInfo.submitTime }}</span>
                </div>
            </div>
        </el-card>
        <el-card class="homework-answer-card">
            <div class="header">作答区域</div>
            <div class="footer" v-if="homeworkInfo.status === 0">
                <editor v-model="homeworkInfo.answer" :min-height="192" placeholder="请输入作答内容" />
                <el-button type="primary" class="btn-submit" :disabled="isAnswerEmpty"
                    v-if="homeworkInfo.status === 0" @click="submit">提交作业</el-button>
            </div>
            <div class="footer" v-else>
                <div class="content" v-html="homeworkInfo.answer"></div>
            </div>
        </el-card>
    </div>
</template>
<script setup name="UserHomeworkDetail">
import { getHomework, submitHomework } from '@/api/user/homework'
import { getCourse } from "@/api/user/course"

const { proxy } = getCurrentInstance()
const { common_status } = proxy.useDict('common_status')
const { homework_status } = proxy.useDict('homework_status')

const route = useRoute()
const router = useRouter()

const courseInfo = ref({})
const homeworkInfo = ref({})
const isAnswerEmpty = computed(() => {
    return homeworkInfo.value.answer == null || !homeworkInfo.value.answer.trim() || !homeworkInfo.value.answer.replace(/<[^>]*>?/gm, '').trim();
})

function getData() {
    getHomework(route.params.homeworkId).then(res => {
        homeworkInfo.value = res.data
        homeworkInfo.value.statusLabel = getDictLabel(homework_status, homeworkInfo.value.status)
    }).then(() => {
        getCourse(homeworkInfo.value.courseId).then(res => {
            courseInfo.value = res.data
        })
    })
}

function submit() {
    proxy.$confirm('确定要提交作业吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        const data = {
            courseId: homeworkInfo.value.courseId,
            homeworkId: homeworkInfo.value.homeworkId,
            answer: homeworkInfo.value.answer
        }
        submitHomework(data).then(() => {
            router.push({ name: 'UserHomework' })
            proxy.$message({
                type: 'success',
                message: '提交成功!'
            })
        })

    })
}

function getDictLabel(dictType, value) {
    const item = dictType.value.find(item => item.value == value)
    return item ? item.label : ''
}
getData()
</script>

<style lang="scss" scoped>
.homework-info-card {
    margin-top: 20px;
    line-height: 30px;

    .header {
        .title {
            .label {
                font-weight: bold;
            }
        }
    }

    .body {
        .content {
            .label {
                font-size: 14px;
            }

            .value {
                font-size: 14px;
            }

            :deep(img) {
                max-width: 100% !important;
                height: auto !important;
                display: block;
                margin: 15px 0;
            }
        }
    }
}

.homework-answer-card {
    margin-top: 20px;

    .header {
        font-size: 16px;
        font-weight: bold;
    }

    .footer {
        margin-top: 20px;

        .btn-submit {
            margin-top: 10px;
            margin-bottom: 20px;
            float: right;
        }
    }
}
</style>