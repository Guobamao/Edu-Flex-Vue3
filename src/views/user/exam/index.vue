<template>
    <div class="app-container">
        <div class="filter-container">
            <el-card>
                <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
                    <el-form-item label="课程名称" prop="courseId">
                        <el-select v-model="queryParams.courseId" placeholder="请选择课程" clearable filterable
                            @change="handleQuery" @clear="resetQuery" style="width: 200px;">
                            <el-option v-for="item in courseOptions" :key="item.id" :label="item.courseName"
                                :value="item.courseId" />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
        </div>
        <el-card>
            <div v-if="breakShow" style="cursor: pointer;" @click="toExam">
                <el-alert :closable="false" title="您有正在进行的考试，离线太久考试将被作废哦，点击此处可继续考试！" type="error" />
            </div>
            <el-collapse v-model="activeNames" @change="handleChange" accordion class="mt5">
                <el-collapse-item v-for="course in filterCourseOptions" :key="course.id" :title="course.courseName"
                    :name="course.courseId">
                    <div class="exam-list">
                        <template v-if="!course.examList || course.examList.length === 0">
                            <el-empty description="暂无考试！" :image-size="100" />
                        </template>
                        <template v-else>
                            <el-card v-for="(item, index) in course.examList" :key="item.id" class="exam-card" shadow="never">
                                <el-tag class="orderNum">{{ index + 1 }}</el-tag>
                                <div class="info">
                                    <div class="header">
                                        <span class="title">{{ item.examName }}</span>
                                    </div>
                                    <div class="body">
                                        <span class="item">试卷总分：{{ item.totalScore }}分</span>
                                        <span class="item">及格分数：{{ item.passScore }}分</span>
                                    </div>
                                    <div class="body">
                                        <span class="item">考试时长: {{ item.duration }}分钟</span>
                                        <span class="item">是否限时：{{ item.limited === 0 ? '不限时' : '限时' }}</span>
                                    </div>
                                    <div v-if="item.limited === 1" class="body">
                                        <span class="item">作答时间：{{ item.startTime }} - {{ item.endTime }}</span>
                                    </div>
                                    <div class="body">
                                        <span class="item">注意事项：多选、少选、错选不得分</span>
                                    </div>
                                </div>
                                <dict-tag v-if="item.submitStatus !== 3" :options="exam_submit_status"
                                    :value="item.submitStatus" class="submit-status" />
                                <div v-else class="final-status">
                                    <div class="score">{{ item.finalScore }}分</div>
                                    <div class="passed">{{ item.passed ? '通过' : '未通过' }}</div>
                                </div>
                                <div class="action-btn">
                                    <el-button v-if="item.status === 0" type="primary" icon="Clock" plain
                                        disabled>未到考试时间</el-button>
                                    <el-button v-else-if="item.status === 1 && item.submitStatus === 0" type="primary"
                                        icon="Edit" plain @click="handlePrepare(item)">去答卷</el-button>
                                    <el-button v-else-if="item.status === 1 && item.submitStatus === 1" type="primary"
                                        icon="Edit" plain @click="toExam(item)">继续答卷</el-button>
                                    <el-button
                                        v-else-if="item.status === 1 && (item.submitStatus === 2 || item.submitStatus === 3)"
                                        type="primary" icon="Edit" plain @click="handleView(item)">查看试卷</el-button>
                                    <el-button v-else-if="item.status === 2" type="primary" icon="View" plain
                                        @click="handleView(item)">查看试卷</el-button>
                                </div>
                            </el-card>
                        </template>
                    </div>
                </el-collapse-item>
            </el-collapse>
        </el-card>
    </div>
</template>
<script setup name="UserExam">
import { listStudentCourse } from "@/api/user/studentCourse";
import { listExam, checkExam } from "@/api/user/exam"

const { proxy } = getCurrentInstance();
const { exam_submit_status } = proxy.useDict("exam_submit_status")

const router = useRouter();

const queryParams = ref({
    pageNum: 1,
    pageSize: 10,
    courseId: null,
})
const total = ref(0);

const courseOptions = ref([]);
const filterCourseOptions = ref([]);
const examList = ref([]);

const activeNames = ref()
const breakShow = ref(false)
const recordId = ref(null)

function getCourseList() {
    listStudentCourse(queryParams.value).then(response => {
        courseOptions.value = response.rows;
        filterCourseOptions.value = courseOptions.value
    });
}

function getList() {
    listExam(queryParams.value).then(res => {
        examList.value = res.rows;
        total.value = res.total;
    })
}

/** 搜索按钮操作 */
function handleQuery() {
    queryParams.value.pageNum = 1;
    filterCourseOptions.value = courseOptions.value.filter(item => item.courseId == queryParams.value.courseId)
}

/** 重置按钮操作 */
function resetQuery() {
    proxy.resetForm("queryRef");
    filterCourseOptions.value = courseOptions.value
}

/** 切换 折叠面板 */
function handleChange(val) {
    const list = examList.value.filter(item => item.courseId == val)
    courseOptions.value.map(item => {
        if (item.courseId == val) {
            item.examList = list
        }
    })
}

// 去考试
function handlePrepare(item) {
    router.push({ name: 'UserExamPrepare', params: { examId: item.examId } })
}

// 继续考试
function toExam(item) {
    router.push({ name: 'UserExamDetail', params: { id: item.recordId || recordId.value } })
}

// 查看考试结果
function handleView(item) {
    if (item.submitStatus === 0) {
        proxy.$modal.msgWarning("未参加考试，无法查看试卷！")
        return;
    }
    router.push({ name: 'UserExamResult', params: { id: item.recordId } })
}

// 检查进行中的考试
function check() {
    checkExam().then(res => {
        if (res.data && res.data.id) {
            breakShow.value = true
            recordId.value = res.data.id
        }
    })                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
}

getCourseList();
check();
getList();
</script>

<style lang="scss" scoped>
.exam-list {

    .exam-card {
        position: relative;
        margin: 10px 20px 10px 20px;

        :deep(.el-card__body) {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .orderNum {
            position: absolute;
            left: 0;
            top: 0;
        }

        .info {
            flex: 0.8;
            margin-left: 20px;

            .header {
                .title {
                    font-size: 16px;
                }
            }

            .body {
                font-size: 14px;

                .item {
                    color: #999;
                    line-height: 25px;
                    margin-right: 15px;
                }
            }
        }

        .submit-status {
            flex: 0.1;

            :deep(.el-tag) {
                padding: 15px 20px;
                font-size: 15px;
            }
        }

        .action-btn {
            flex: 0.15;
        }
    }
}
</style>