<template>
    <div class="app-container">
        <el-card class="mb20">
            <div class="filter-group">
                <div class="title">方向</div>
                <div class="content">
                    <el-link v-for="item in directionOptions" :key="item.id" underline='never'
                        :class="{ 'active': selectedDirection === item.id }" @click="handleClickDirection(item.id)">
                        {{ item.name }}
                    </el-link>
                </div>
            </div>
            <div class="filter-group" v-if="selectedDirection != null">
                <div class="title">分类</div>
                <div class="content">
                    <el-link v-for="item in categoryOptions" :key="item.id" underline='never'
                        :class="{ 'active': selectedCategory === item.id }" @click="handleClickCategory(item.id)">
                        {{ item.name }}
                    </el-link>
                </div>
            </div>
        </el-card>

        <div class="course-list">
            <el-row :gutter="20">
                <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6" v-for="item in courseList" :key="item.id">
                    <el-card shadow="hover" class="course-card">
                        <el-link underline='never' style="width: 100%; overflow: hidden"
                            @click="handleRouterPush(item.id)">
                            <el-image :src="item.cover" style="width: 100%; height: 150px;" class="course-cover" />
                        </el-link>
                        <div class="info">
                            <div class="title">
                                <el-link underline='never' @click="handleRouterPush(item.id)">{{ item.name }}</el-link>
                            </div>
                            <div class="meta">
                                <span class="teacherName">讲师: {{ item.teacherName }}</span>
                                <span class="videoNum">{{ item.videoNum }} 节课</span>
                                <span class="selectedNum">{{ item.selectedNum }} 人已选</span>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </div>

        <pagination v-show="total > 0" :total="total" v-model:page="pageParams.pageNum"
            v-model:limit="pageParams.pageSize" layout="total, prev, pager, next, jumper" @pagination="getCourseList" />
    </div>
</template>

<script setup name="UserCourseIndex">
import { listDirection } from "@/api/user/direction";
import { listCategory } from "@/api/user/category";
import { listCourse } from "@/api/user/course";

const { proxy } = getCurrentInstance();

const router = useRouter();

const directionOptions = ref([]);
const categoryOptions = ref([]);

const selectedDirection = ref(null);
const selectedCategory = ref(null);

const courseList = ref([]);

const pageParams = ref({
    pageNum: 1,
    pageSize: 12,
})
const total = ref(0);

function getList() {
    const params = {
        status: 1
    }
    listDirection(params).then(res => {
        directionOptions.value = res.rows;
        directionOptions.value.unshift({
            id: null,
            name: '全部'
        })
    })
    getCourseList();
}

function handleClickDirection(id) {
    if (selectedDirection.value !== id) {
        selectedCategory.value = null;
    }
    selectedDirection.value = id;
    if (id !== null) {
        listCategory(selectedDirection.value).then(res => {
            categoryOptions.value = res.data;
            categoryOptions.value.unshift({
                id: null,
                name: '全部'
            })
        })
    }
    getCourseList();
}

function handleClickCategory(id) {
    selectedCategory.value = id;
    getCourseList();
}

function getCourseList() {
    const params = {
        ...pageParams.value,
        directionId: selectedDirection.value,
        categoryId: selectedCategory.value,
    }
    listCourse(params).then(res => {
        courseList.value = res.rows;
        courseList.value.forEach(item => {
            item.cover = proxy.$previewUrl + item.cover
        })
        total.value = res.total;
    })
}

function handleRouterPush(courseId) {
    router.push({ name: 'UserCourseDetail', params: { courseId: courseId } });
}

document.title = '课程 - 学智灵云课堂';

getList();
</script>

<style lang="scss" scoped>
.filter-group {
    display: flex;
    margin-top: 20px;

    .title {
        width: 50px;
        font-weight: bold;
    }

    .content {
        display: flex;
        flex-wrap: wrap;
    }

    .content a {
        margin-right: 15px;
        margin-bottom: 5px;
        padding: 0 5px;
    }

    .content a.active {
        background-color: #409EFF;
        color: #FFF;
    }
}

.course-list {
    .course-card {
        margin-bottom: 20px;
        position: relative;

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
}
</style>