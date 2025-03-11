<template>
    <div class="comment-list">
        <template v-if="commentList.length">
            <el-card v-for="item in commentList" :key="item.id" class="comment-card" shadow="never">
                <el-avatar :src="item.avatar">
                    {{ item.nickName }}
                </el-avatar>
                <div class="comment-info">
                    <div class="comment-body">
                        <span class="username">
                            {{ item.nickName }}
                        </span>
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
        <template v-else>
            <el-empty description="暂无评论，快来发表评论吧！" />
        </template>
    </div>
</template>
<script setup name="MyComment">
import { listComment } from "@/api/user/comment";
import useUserStore from '@/store/modules/user'

const { proxy } = getCurrentInstance();
const userStore = useUserStore()

const route = useRoute();

const commentList = ref([]);

const queryParams = ref({
    pageNum: 1,
    pageSize: 5,
    userId: userStore.id
})
const total = ref(0);

// 获取评论列表
function getList() {
    listComment(queryParams.value).then(res => {
        res.rows.forEach(item => {
            item.avatar = proxy.$previewUrl + item.avatar
        })
        commentList.value = proxy.handleTree(res.rows, 'id', 'parentId')
        total.value = res.total;
    })
}

getList()
</script>
<style lang="scss" scoped>
.comment-list {
    .comment-card {
        margin-bottom: 10px;

        :deep(.el-card__body) {
            display: flex;
        }

        .comment-info {
            width: 100%;
            margin-left: 10px;
            line-height: 25px;

            .comment-body {
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