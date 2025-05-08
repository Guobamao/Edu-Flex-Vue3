<template>
    <div class="homework-list">
        <template v-if="!homeworkList.length">
            <el-empty description="暂无作业！" />
        </template>
        <template v-else>
            <el-card v-for="(item, index) in homeworkList" :key="item.id" class="homework-card" shadow="never">
                <el-tag class="orderNum">{{ index + 1 }}</el-tag>
                <div class="info">
                    <div class="header">
                        <span class="title">{{ item.title }}</span>
                    </div>
                    <div class="footer">
                        作业内容: {{ item.content }}
                    </div>
                </div>
                <dict-tag :options="homework_status" :value="item.status" class="homework-status"
                    :class="item.status == 0 ? 'undo' : item.status == 1 ? 'pending' : 'done'" />
                <!-- 未做 -->
                <el-button v-if="item.status === 0" type="primary" icon="Edit" plain @click="handleEdit(item)"
                    class="btn-edit">去完成</el-button>
                <!-- 作业已做 -->
                <el-button v-if="item.status !== 0" type="primary" icon="View" plain @click="handleEdit(item)"
                    class="btn-edit">查看作业</el-button>
            </el-card>

            <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize" layout="total, prev, pager, next, jumper" @pagination="getList" />
        </template>
    </div>
</template>
<script setup name="CourseHomework">
import { listHomework } from "@/api/user/homework";

const { proxy } = getCurrentInstance();
const { homework_status } = proxy.useDict("homework_status")

const route = useRoute();
const router = useRouter();

const queryParams = ref({
    pageNum: 1,
    pageSize: 10,
    courseId: route.params.courseId
})
const total = ref(0);

// 课程作业列表
const homeworkList = ref([]);

function getList() {
    listHomework(queryParams.VALUE).then(res => {
        homeworkList.value = res.rows;
        total.value = res.total;
    })
}

function handleEdit(item) {
    router.push({ name: 'UserHomeworkDetail', params: { homeworkId: item.homeworkId } })
}

getList();

</script>
<style lang="scss" scoped>
.homework-list {

    .homework-card {
        position: relative;

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
                width: 55%;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: normal;
                color: #999;
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

        .btn-edit {
            position: absolute;
            right: 5%;
            top: 48%;
        }
    }

    .pagination-container {
        margin-bottom: 30px;
    }
}
</style>