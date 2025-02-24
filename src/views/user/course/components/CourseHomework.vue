<template>
    <el-card v-for="(item, index) in homeworkList" :key="item.id" class="homework-card">
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
        <dict-tag :options="homework_status" :value="item.homeworkStatus" class="homework-status"
            :class="item.homeworkStatus == 0 ? 'undo' : item.homeworkStatus == 1 ? 'pending' : 'done'" />
        <dict-tag :options="common_status" :value="item.status" class="status" />
        <!-- 作业未结束 and 未做 -->
        <el-button v-if="item.status === 1 && item.homeworkStatus === 0" type="primary" icon="Edit" plain
            @click="handleEdit(item)" class="btn-edit">去完成</el-button>
        <!-- 作业已做 -->
        <el-button v-if="item.homeworkStatus !== 0" type="primary" icon="View" plain @click="handleEdit(item)"
            class="btn-edit">查看作业</el-button>
    </el-card>
</template>
<script setup name="CourseHomework">
import { listHomework } from "@/api/user/homework";

const { proxy } = getCurrentInstance();
const { common_status } = proxy.useDict("common_status")
const { homework_status } = proxy.useDict("homework_status")

const route = useRoute();
const router = useRouter();

// 课程作业列表
const homeworkList = ref([]);
const total = ref(0);

function getList() {
    listHomework({ courseId: route.params.courseId }).then(res => {
        homeworkList.value = res.rows;
        total.value = res.total;
    })
}

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
            font-size: 14px;
            .time {
                color: #999;
            }
        }

        .footer {
            font-size: 14px;
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