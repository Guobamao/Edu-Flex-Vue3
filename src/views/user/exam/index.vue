<template>
    <div class="app-container">
        <div class="filter-container">
            <el-card>
                <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
                    <el-form-item label="课程名称" prop="courseId">
                        <el-select v-model="queryParams.courseId" placeholder="请选择课程" clearable filterable
                            @change="handleQuery" @clear="handleQuery" style="width: 200px;">
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
            <el-collapse v-model="activeNames" accordion @change="handleChange">
                <el-collapse-item v-for="course in filterCourseOptions" :key="course.id" :title="course.courseName"
                    :name="course.courseId">
                    <el-card shadow="never" v-for="(item, index) in course.examList" :key="item.id" class="exam-card">
                        <el-tag class="orderNum">{{ index + 1 }}</el-tag>
                        <div class="info">
                            <div>
                                <span class="title">{{ item.examName }}</span>
                            </div>
                            <div>
                                <span class="score">试卷总分：{{ item.totalScore }}分</span>
                                <span class="score">及格分数：{{ item.passScore }}分</span>
                            </div>
                            <div>
                                <span class="duration">考试时长: {{ item.duration }}分钟</span>
                                <span class="limited">是否限时：{{ item.limited === 0 ? '不限时' : '限时' }}</span>
                            </div>
                            <div v-if="item.limited === 1">
                                <span class="limited-time">作答时间：{{ item.startTime }} - {{ item.endTime }}</span>
                            </div>
                            <div>
                                <span class="desc">注意事项：多选、少选、错选不得分</span>
                            </div>
                        </div>
                        <!-- 考试状态 -->
                        <dict-tag :options="common_status" :value="item.status" class="status" />
                        <el-button v-if="item.status === 0" type="primary" icon="Clock" plain disabled
                            class="btn-edit">未到考试时间</el-button>
                        <el-button v-else-if="item.status === 1 && item.submitStatus === 0" type="primary" icon="Edit"
                            plain class="btn-edit" @click="handleEdit(item)">去答卷</el-button>
                        <el-button v-else-if="item.status === 1 && item.submitStatus === 1" type="primary" icon="Edit"
                            plain class="btn-edit" @click="handleEdit(item)">继续答卷</el-button>
                        <el-button v-else-if="item.status === 1 && item.submitStatus === 2" type="primary" icon="Edit"
                            plain class="btn-edit" @click="handleEdit(item)">查看试卷</el-button>
                        <el-button v-else-if="item.status === 2" type="primary" icon="View" plain
                            class="btn-edit" @click="handleEdit(item)">查看试卷</el-button>
                    </el-card>
                </el-collapse-item>
            </el-collapse>
        </el-card>
    </div>
</template>
<script setup name="UserExam">
import { listStudentCourse } from "@/api/user/studentCourse";
import { listExam } from "@/api/user/exam"

const { proxy } = getCurrentInstance();
const { common_status } = proxy.useDict("common_status")

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
    // getList();
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

function handleEdit(item) {
    router.push({ name: 'UserExamPrepare', params: { examId: item.examId } })
}

getCourseList();
getList();
</script>

<style lang="scss" scoped>
.exam-card {
    position: relative;

    .orderNum {
        position: absolute;
        left: 0;
        top: 0;
    }

    .info {
        margin-left: 20px;

        .title {
            font-size: 16px;
            color: #101010;
        }

        span {
            color: #999;
        }

        .score {
            margin-right: 20px;
        }

        .duration {
            margin-right: 20px;
        }
    }

    .exam-status {
        position: absolute;
        right: 20%;
        top: 45%;
        text-align: center;
        padding: 5px 10px;
        border-radius: 10px;
    }

    .exam-status.undo {
        color: red;
        border: 1px solid red;
    }

    .exam-status.pending {
        color: green;
        border: 1px solid green;
    }

    .exam-status.done {
        color: blue;
        border: 1px solid blue;
    }

    .status {
        position: absolute;
        right: 0;
        top: 0;
    }

    .btn-edit {
        position: absolute;
        right: 5%;
        top: 48%;
    }
}
</style>