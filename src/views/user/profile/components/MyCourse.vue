<template>
    <div class="course-list">
        <template v-if="!courseList.length">
            <el-empty description="暂无加入选课的课程！" />
        </template>
        <template v-else>
            <el-row :gutter="20">
                <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6" v-for="item in courseList" :key="item.id">
                    <el-card shadow="hover" class="course-card">
                        <el-link :underline="false" style="width: 100%; overflow: hidden"
                            @click="handleRouterPush(item.courseId)">
                            <el-image :src="item.cover" style="width: 100%; height: 150px;" class="course-cover" />
                        </el-link>
                        <div class="info">
                            <div class="title">
                                <el-link :underline="false" @click="handleRouterPush(item.courseId)">
                                    {{ item.courseName }}
                                </el-link>
                            </div>
                            <div class="meta">
                                <span class="progress">已完成 {{ item.progress }}%</span>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
            <pagination v-show="total > 0" :total="total" v-model:page="pageParams.pageNum"
                v-model:limit="pageParams.pageSize" layout="total, prev, pager, next, jumper"
                @pagination="getCourseList" />
        </template>
    </div>
</template>
<script setup name="MyCourse">
import { listStudentCourse } from "@/api/user/studentCourse";

const { proxy } = getCurrentInstance();
const router = useRouter();

const courseList = ref([])

const pageParams = ref({
    pageNum: 1,
    pageSize: 12,
})
const total = ref(0);

function getCourseList() {
    const params = {
        ...pageParams.value
    }
    listStudentCourse(params).then(res => {
        courseList.value = res.rows;
        courseList.value.forEach(item => {
            item.cover = proxy.$previewUrl + item.cover
        })
        total.value = res.total;
    });
}

function handleRouterPush(courseId) {
    router.push({ name: 'UserCourseDetail', params: { courseId: courseId } });
}

getCourseList();
</script>
<style lang="scss" scoped>
.course-list {
    .course-card {
        margin-bottom: 20px;
        position: relative;

        .course-status {
            position: absolute;
            top: 0;
            right: 0;
            z-index: 2;
        }

        :deep(.el-card__body) {
            padding: 0 !important;

            .el-link__inner {
                flex: 1;
            }
        }

        .course-cover {
            transition: all 0.6s;
        }

        .course-cover:hover {
            transform: scale(1.1);
        }

        .info {
            padding: 10px;
            padding-bottom: 18px;

            .title {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .meta {
                font-size: 13px;

                .videoNum {
                    margin-left: 10px;
                }

                .selectedNum {
                    margin-left: 10px;
                }
            }
        }
    }
}

.pagination-container {
    background: transparent;
    margin-top: 0;
    margin-bottom: 30px;
}
</style>