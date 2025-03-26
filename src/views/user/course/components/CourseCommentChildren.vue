<template>
    <div class="comment-children">
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
                </div>
            </div>
        </div>
        <pagination v-show="total > 3" :total="total" v-model:page="queryParams.pageNum" :background="false"
            v-model:limit="queryParams.pageSize" layout="prev, pager, next" @pagination="getList" />
    </div>
</template>
<script setup name="CourseCommentChildren">
import { listComment } from "@/api/user/comment";
const { proxy } = getCurrentInstance();

const props = defineProps({
    courseId: {
        type: String
    },
    parentId: {
        type: String,
    }
})

defineExpose({ getList })

const commentList = ref([]);
const queryParams = ref({
    pageNum: 1,
    pageSize: 3,
    courseId: props.courseId,
    parentId: props.parentId
})
const total = ref(0);

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
getList()
</script>
<style lang="scss" scoped>
.comment-children {
    .comment-item {
        display: flex;
        flex-direction: column;
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
            }
        }
    }
}
</style>