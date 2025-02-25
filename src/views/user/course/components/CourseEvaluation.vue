<template>
    <div class="evaluation-list">
        <template v-if="!evaluationList.length">
            <el-empty description="暂无评价，快来发表评价吧！" />
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
        <el-form :model="form" class="evaluation-form" label-width="80px" v-if="isLogin">
            <el-form-item label="评分">
                <el-rate v-model="form.score" />
            </el-form-item>
            <el-form-item label="评价内容">
                <el-input v-model="form.content" type="textarea" :rows="5" placeholder="请输入评价内容" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="saveEvaluation">发表评价</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>
<script setup name="CourseEvaluation">
import { listEvaluation, addEvaluation } from '@/api/user/evaluation';
import { getToken } from "@/utils/auth"

const { proxy } = getCurrentInstance();

const route = useRoute();

const queryParams = ref({
    pageNum: 1,
    pageSize: 10,
    courseId: route.params.courseId
})
const total = ref(0);

const evaluationList = ref([]);

const form = ref({
    content: '',
    score: 0
})
// 是否已登录
const isLogin = computed(() => getToken())

function getList() {
    listEvaluation(queryParams.value).then(res => {
        evaluationList.value = res.rows;
        total.value = res.total;
        evaluationList.value.forEach(item => {
            item.avatar = proxy.$previewUrl + item.avatar;
        });
    })
}

function saveEvaluation() {
    const data = {
        courseId: route.params.courseId,
        content: form.value.content,
        score: form.value.score
    }
    addEvaluation(data).then(res => {
        proxy.$modal.msgSuccess("发表成功");
        form.value.content = '';
        form.value.score = 0;
        getList();
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
    }
}
</style>