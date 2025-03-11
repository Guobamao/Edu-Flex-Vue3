<template>
    <div class="evaluation-list">
        <template v-if="!evaluationList.length">
            <el-empty description="暂无评价，快去发表评价吧！" />
        </template>
        <template v-else>
            <el-card v-for="(item, index) in evaluationList" :key="index" class="evaluation-card" shadow="never">
                <el-avatar :src="item.avatar">
                    {{ item.nickname }}
                </el-avatar>
                <div class="evaluation-info">
                    <div class="evaluation-body">
                        <span class="username">
                            {{ item.nickName }}
                        </span>
                        <el-rate v-model="item.score" disabled show-score />
                    </div>
                    <div class="courseName">
                        <el-link :href="'/course/' + item.courseId" target="_blank">{{ item.courseName }}</el-link>
                    </div>
                    <div class="createTime">
                        {{ item.createTime }}
                    </div>
                    <div class="content">
                        {{ item.content }}
                    </div>
                </div>
            </el-card>
            <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize" layout="total, prev, pager, next, jumper" @pagination="getList" />
        </template>
    </div>
</template>
<script setup name="MyEvaluation">
import { listEvaluation } from '@/api/user/evaluation';
import useUserStore from '@/store/modules/user'

const { proxy } = getCurrentInstance();
const userStore = useUserStore()

const queryParams = ref({
    pageNum: 1,
    pageSize: 5,
    userId: userStore.id
})

const total = ref(0);

const evaluationList = ref([]);

function getList() {
    listEvaluation(queryParams.value).then(res => {
        evaluationList.value = res.rows;
        total.value = res.total;
        evaluationList.value.forEach(item => {
            item.avatar = proxy.$previewUrl + item.avatar;
        });
    })
}

getList();
</script>
<style lang="scss" scoped>
.evaluation-list {
    .evaluation-card {
        margin-bottom: 10px;

        :deep(.el-card__body) {
            display: flex;
        }

        .evaluation-info {
            width: 100%;
            margin-left: 10px;
            line-height: 25px;

            .evaluation-body {
                display: flex;
                justify-content: space-between;
                height: 22px;

                .username {
                    font-size: 15px;
                }
            }

            .createTime {
                font-size: 14px;
                color: #999;
            }
        }
    }

    .pagination-container {
        margin-bottom: 30px;
        background-color: transparent;
    }
}
</style>