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
            <el-collapse v-model="activeNames" accordion @change="handleChange">
                <el-collapse-item v-for="course in filterCourseOptions" :key="course.id" :title="course.courseName"
                    :name="course.courseId">
                    <div class="homework-list">
                        <template v-if="!course.homeworkList || course.homeworkList.length === 0">
                            <el-empty description="暂无作业！" :image-size="100" />
                        </template>
                        <template v-else>
                            <el-card v-for="(item, index) in course.homeworkList" :key="item.id" class="homework-card">
                                <el-tag class="orderNum">{{ index + 1 }}</el-tag>
                                <div class="info">
                                    <div class="header">
                                        <span class="title">{{ item.title }}</span>
                                    </div>
                                    <div class="body">
                                        <span class="time">截止时间: {{ item.deadline }}</span>
                                    </div>
                                    <div class="footer">
                                        <span class="content">作业内容: {{ item.content }}</span>
                                    </div>
                                </div>
                                <dict-tag :options="homework_status" :value="item.homeworkStatus"
                                    class="homework-status"
                                    :class="item.homeworkStatus == 0 ? 'undo' : item.homeworkStatus == 1 ? 'pending' : 'done'" />
                                <dict-tag :options="common_status" :value="item.status" class="status" />
                                <!-- 作业未结束 and 未做 -->
                                <el-button v-if="item.status === 1 && item.homeworkStatus === 0" type="primary"
                                    icon="Edit" plain @click="handleEdit(item)" class="btn-edit">去完成</el-button>
                                <!-- 作业已做 -->
                                <el-button v-if="item.homeworkStatus !== 0" type="primary" icon="View" plain
                                    @click="handleEdit(item)" class="btn-edit">查看作业</el-button>
                            </el-card>
                        </template>
                    </div>
                </el-collapse-item>
            </el-collapse>
        </el-card>
    </div>
</template>
<script setup name="UserHomeWork">
import { listStudentCourse } from "@/api/user/studentCourse";
import { listHomework } from "@/api/user/homework"

const { proxy } = getCurrentInstance();
const { common_status } = proxy.useDict("common_status")
const { homework_status } = proxy.useDict("homework_status")

const router = useRouter();

const queryParams = ref({
    pageNum: 1,
    pageSize: 10,
    courseId: null,
})
const total = ref(0);

const courseOptions = ref([]);
const filterCourseOptions = ref([]);
const homeworkList = ref([]);

const activeNames = ref()

function getCourseList() {
    listStudentCourse(queryParams.value).then(response => {
        courseOptions.value = response.rows;
        filterCourseOptions.value = courseOptions.value
    });
}

function getList() {
    listHomework(queryParams.value).then(res => {
        homeworkList.value = res.rows;
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
    const list = homeworkList.value.filter(item => item.courseId == val)
    courseOptions.value.map(item => {
        if (item.courseId == val) {
            item.homeworkList = list
        }
    })
}

function handleEdit(item) {
    router.push({ name: 'UserHomeworkDetail', params: { homeworkId: item.homeworkId } })
}

getCourseList();
getList();
</script>

<style lang="scss" scoped>
.homework-card {
    position: relative;
    margin: 10px 20px 10px 20px;

    .orderNum {
        position: absolute;
        left: 0;
        top: 0;
    }

    .info {
        margin-left: 20px;

        .header {
            .title {
                font-size: 16px;
            }
        }

        .body {
            .time {
                color: #999;
            }
        }

        .footer {
            .content {
                color: #999;
            }
        }
    }

    .homework-status {
        position: absolute;
        right: 20%;
        top: 45%;
        text-align: center;
        padding: 5px 10px;
        border-radius: 10px;
    }

    .homework-status.undo {
        color: red;
        border: 1px solid red;
    }

    .homework-status.pending {
        color: green;
        border: 1px solid green;
    }

    .homework-status.done {
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