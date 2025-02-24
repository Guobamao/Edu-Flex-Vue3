<template>
    <div class="comment-list">
        <template v-if="commentList.length">
            <el-row v-for="item in commentList" :key="item.id" justify="center" :gutter="20" class="comment-item">
                <el-col :span="2" class="text-center">
                    <el-avatar :src="item.avatar" />
                </el-col>
                <el-col :span="22">
                    <div class="comment-header">
                        <span class="comment-name">{{ item.nickName }}</span>
                    </div>
                    <div class="comment-body" v-html="item.content"></div>
                    <div class="comment-footer">
                        <span class="comment-time">{{ item.createTime }}</span>
                        <el-link v-if="isLogin" @click="handleReply(item.id, item.nickName)"
                            class="comment-reply">回复</el-link>
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
                    <div v-if="item.children && item.children.length" class="comment-children">
                        <el-row v-for="child in item.children" :key="child.id" justify="center" :gutter="20"
                            class="comment-item">
                            <el-col :span="2" class="text-center">
                                <el-avatar :src="child.avatar" />
                            </el-col>
                            <el-col :span="22">
                                <div class="comment-header">
                                    <span class="comment-name">{{ child.nickName }}</span>
                                </div>
                                <div class="comment-body" v-html="child.content"></div>
                                <div class="comment-footer">
                                    <span class="comment-time">{{ child.createTime }}</span>
                                </div>
                            </el-col>
                        </el-row>
                    </div>
                </el-col>
            </el-row>
        </template>
        <template v-else>
            <el-empty description="暂无评论，快来发表评论吧！" />
        </template>
        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize" layout="total, prev, pager, next, jumper" @pagination="getList" />
        <div v-if="isLogin && !replyTo.id">
            <editor v-model="inputValue" :min-height="192" placeholder="请输入评论内容" />
            <el-button type="primary" class="btn-submit" :disabled="isCommentEmpty"
                @click="handleComment">发表评论</el-button>
        </div>
    </div>
</template>
<script setup name="CourseComment">
import { listComment, addComment } from "@/api/user/comment";
import { getToken } from "@/utils/auth"


const { proxy } = getCurrentInstance();

const route = useRoute();

const commentList = ref([]);

const inputValue = ref('<p></p>');
const replyTo = ref({});


const queryParams = ref({
    pageNum: 1,
    pageSize: 10,
    courseId: route.params.courseId
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
        res.rows.forEach(item => {
            item.avatar = proxy.$previewUrl + item.avatar
        })
        commentList.value = proxy.handleTree(res.rows, 'id', 'parentId')
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
        getList()
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
        border-bottom: 1px solid #eee;
        margin-bottom: 5px;
        padding-bottom: 5px;
        margin-top: 5px;
        padding-top: 5px;
    }

    .comment-header {
        .comment-name {
            font-size: 14px;
        }
    }

    .comment-body {
        color: #666;
        font-size: 15px;

        * {
            margin: 5px 0;
        }
    }

    .comment-footer {
        display: flex;
        align-items: baseline;

        .comment-time {
            font-size: 13px;
            color: #999;
        }

        .comment-reply {
            font-size: 13px;
            margin-left: 10px;
        }
    }

    .reply-to {
        display: flex;
        align-items: baseline;
        font-size: 13px;
        margin-top: 5px;
    }

    .comment-children {
        .comment-item {
            border-bottom: none;
        }
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