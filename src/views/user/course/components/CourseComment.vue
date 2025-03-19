<template>
    <div class="comment-list">
        <template v-if="commentList.length">
            <div v-for="item in commentList" :key="item.id" class="comment-item">
                <div class="comment-body">
                    <el-avatar :src="item.avatar" />
                    <div class="comment-info">
                        <div class="comment-header">
                            <span class="comment-name">{{ item.nickName }}</span>
                        </div>
                        <div class="createTime">
                            {{ item.createTime }}
                        </div>
                        <div class="content">
                            {{ item.content }}
                        </div>
                        <div class="reply">
                            <el-link v-if="isLogin" @click="handleReply(item.id, item.nickName)"
                                class="comment-reply">回复</el-link>
                        </div>
                    </div>
                </div>
                <div v-if="isLogin && replyTo.id === item.id">
                    <div class="reply-to">
                        回复 {{ replyTo.nickName }}
                        <el-link @click="cancelReply" style="margin-left: 10px;">取消回复</el-link>
                    </div>
                    <editor v-model="inputValue" :min-height="192" placeholder="请输入评论内容" />
                    <el-button type="primary" class="btn-submit" :disabled="isCommentEmpty"
                        @click="handleComment">发表评论</el-button>
                </div>
                <CourseCommentChildren ref="childrenRef" :courseId="item.courseId" :parentId="item.id" />
            </div>
            <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize" layout="total, prev, pager, next, jumper" @pagination="getList" />
        </template>
        <template v-else>
            <el-empty description="暂无评论，快来发表评论吧！" />
        </template>
        <div v-if="isLogin && !replyTo.id">
            <editor v-model="inputValue" :min-height="192" placeholder="请输入评论内容" />
            <el-button type="primary" class="btn-submit" :disabled="isCommentEmpty"
                @click="handleComment">发表评论</el-button>
        </div>
    </div>
</template>
<script setup name="CourseComment">
import { listComment, addComment } from "@/api/user/comment";
import { getToken } from "@/utils/auth";
import CourseCommentChildren from "./CourseCommentChildren.vue";


const { proxy } = getCurrentInstance();

const route = useRoute();

const commentList = ref([]);

const inputValue = ref('<p></p>');
const replyTo = ref({});
const childrenRef = ref(null);


const queryParams = ref({
    pageNum: 1,
    pageSize: 10,
    courseId: route.params.courseId,
    parentId: 0
})
const total = ref(0);

// 是否已登录
const isLogin = computed(() => getToken())
// 评论为空
const isCommentEmpty = computed(() => {
    return !inputValue.value.trim() || !inputValue.value.replace(/<[^>]*>?/gm, '').trim();
})

// 获取评论列表
function getList() {
    listComment(queryParams.value).then(res => {
        commentList.value = res.rows;
        commentList.value.forEach(item => {
            item.avatar = proxy.$previewUrl + item.avatar
        })
        total.value = res.total;
    })
}

// 发送评论
function handleComment() {
    if (!isLogin) {
        proxy.$message.error('请先登录')
        return
    }
    if (!isCommentEmpty) {
        proxy.$message.error('评论内容不能为空')
        return
    }

    const data = {
        courseId: route.params.courseId,
        content: inputValue.value,
        parentId: replyTo.value.id || null
    }
    addComment(data).then(() => {
        proxy.$message.success('评论成功')
        inputValue.value = "<p></p>"
        replyTo.value = {}
        getList();
    })
}

// 回复评论
function handleReply(id, nickName) {
    replyTo.value = { id, nickName }
}
// 取消回复
function cancelReply() {
    replyTo.value = {}
}

getList()
</script>
<style lang="scss" scoped>
.comment-list {
    .comment-item {
        display: flex;
        flex-direction: column;
        border-bottom: 1px solid #eee;
        padding: 15px 20px 5px 20px;

        .comment-body {
            display: flex;

            .comment-info {
                margin-left: 10px;

                .comment-header {
                    .comment-name {
                        font-size: 15px;
                    }
                }

                .createTime {
                    font-size: 14px;
                    color: #999;
                }

                .reply {
                    margin-top: 5px;
                }
            }
        }
    }

    .reply-to {
        display: flex;
        align-items: baseline;
        font-size: 13px;
        margin-top: 5px;
    }

    .pagination-container {
        margin-bottom: 30px;
    }

    .btn-submit {
        margin-top: 10px;
        float: right;
    }
}
</style>