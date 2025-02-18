<template>
    <div class="app-container">
        <el-row :gutter="20">
            <el-col :span="16">
                <el-row :gutter="10" justify="space-between" align="middle">
                    <el-col :span="21">
                        <el-input v-model="searchValue" class="search-input" @keyup.enter="getList" />
                    </el-col>
                    <el-col :span="3">
                        <el-button type="primary" class="search-btn" @click="getList">搜索</el-button>
                    </el-col>
                </el-row>
            </el-col>
        </el-row>
        <el-row :gutter="20" class="mt20">
            <el-col :xs="24" :sm="24" :md="14" :lg="16" :xl="18">
                <el-card shadow="never" class="mb20">
                    <el-tabs v-model="activeTab">
                        <el-tab-pane label="课程" name="course">
                            <div v-for="item in courseList" :key="item.id" class="course-item">
                                <el-row :gutter="10">
                                    <el-col :span="7">
                                        <el-link :underline="false" style="width: 100%; overflow: hidden"
                                            @click="handleRouterPush(item.id)">
                                            <el-image :src="item.cover" fit="cover"
                                                style="width: 100%; height: 100px;" />
                                        </el-link>
                                    </el-col>
                                    <el-col :span="16" style="line-height: 25px;">
                                        <el-link :underline="false" @click="handleRouterPush(item.id)">
                                            {{ item.name }}</el-link>
                                        <div class="desc">{{ item.description }}</div>
                                        <div class="meta">
                                            <span class="teacherName">讲师: {{ item.teacherName }}</span>
                                            <span class="categoryName">分类: {{ item.categoryName }}</span>
                                            <span class="videoNum">{{ item.videoNum }} 节课</span>
                                            <span class="selectedNum">{{ item.selectedNum }} 人已选</span>
                                        </div>
                                    </el-col>
                                </el-row>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="24" :md="10" :lg="8" :xl="6">
                <el-card shadow="never" class="recommend-course">
                    <span style="font-size: 14px;">推荐课程</span>
                    <div v-for="item in recommendCourseList" :key="item.id" class="recommend-course-item">
                        <el-row :gutter="10" align="middle">
                            <el-col :span="8">
                                <el-image :src="item.cover" fit="cover" style="width: 100%; height: 50px;">
                                </el-image>
                            </el-col>
                            <el-col :span="16" style="line-height: 25px;">
                                <div class="title">
                                    <el-link :underline="false" @click="handleRouterPush(item.id)">{{ item.name
                                    }}</el-link>
                                </div>
                                <div class="meta">
                                    <span class="teacherName">讲师: {{ item.teacherName }}</span>
                                    <span class="videoNum">{{ item.videoNum }} 节课</span>
                                    <span class="selectedNum">{{ item.selectedNum }} 人已选</span>
                                </div>
                            </el-col>
                        </el-row>
                    </div>
                </el-card>
                <el-card shadow="never">
                    <span style="font-size: 14px;">热门搜索</span>
                    <div class="search-list">
                        <div v-for="(item, index) in searchList" :key="index" class="search-item">
                            <el-tag @click="onClickTag(item)">{{ item }}</el-tag>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>
        <el-row>
            <el-col :xs="24" :sm="24" :md="14" :lg="16" :xl="18">
                <pagination v-show="total > 0" :total="total" v-model:page="pageParams.pageNum"
                    v-model:limit="pageParams.pageSize" layout="total, prev, pager, next, jumper"
                    @pagination="getList" />
            </el-col>
        </el-row>
    </div>
</template>
<script setup name="Search">
import { searchCourse } from "@/api/user/course"
import { listRecommendCourse } from "@/api/user/course"
import { listSearch } from "@/api/user/search"

const { proxy } = getCurrentInstance()

const route = useRoute()
const router = useRouter()

const searchValue = ref(route.query.query || '')
const activeTab = ref('course')
const courseList = ref([])
const pageParams = ref({
    pageNum: 1,
    pageSize: 10,
})
const total = ref(0);

const recommendCourseList = ref([])
const searchList = ref([])

function getList() {
    if (!searchValue.value) {
        proxy.$message.error('请输入搜索内容')
        return
    }
    router.push({ name: 'UserSearch', query: { query: searchValue.value } })
    const params = {
        ...pageParams.value,
        searchValue: searchValue.value
    }
    searchCourse(params).then(res => {
        courseList.value = res.rows
        courseList.value.forEach(item => {
            item.cover = proxy.$previewUrl + item.cover
        })
        total.value = res.total;
    })
}

function handleRouterPush(courseId) {
    router.push({ name: 'UserCourseDetail', params: { courseId: courseId } });
}

function getRecommendCourseList() {
    listRecommendCourse().then(res => {
        recommendCourseList.value = res.data
        recommendCourseList.value.forEach(item => {
            item.cover = proxy.$previewUrl + item.cover
        })
    })
}

function getSearchList() {
    listSearch().then(res => {
        searchList.value = res.data
    })
}

function onClickTag(item) {
    searchValue.value = item
    getList()
}

document.title = `搜索 - ${route.query.query}  学智灵云课堂`;
getRecommendCourseList();
getSearchList();
getList();
</script>

<style lang="scss" scoped>
.app-container {
    .search-input {
        height: 40px;
    }

    .search-btn {
        height: 35px;
        width: 100%;
    }

    .course-item {
        border-bottom: 1px solid #eee;
        margin-bottom: 5px;
        padding-bottom: 5px;
        padding-top: 5px;

        .desc {
            font-size: 13px;
            overflow: hidden;
            display: -webkit-box;
            line-clamp: 2;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            word-break: break-all;
        }

        .title {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .meta {
            font-size: 13px;

            .categoryName {
                margin-left: 15px;
            }

            .videoNum {
                margin-left: 15px;
            }

            .selectedNum {
                margin-left: 15px;
            }
        }
    }

    .recommend-course {
        margin-bottom: 20px;

        .recommend-course-item {
            margin-top: 5px;
            margin-bottom: 5px;
            padding-top: 5px;
            padding-bottom: 5px;
            border-bottom: 1px solid #eee;
        }

        .course-name {
            font-size: 14px;
        }

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
    
    .search-list {
        margin-top: 10px;
        display: flex;
        flex-wrap: wrap;

        .search-item {
            margin-right: 10px;
            margin-bottom: 10px;
            cursor: pointer;
        }
    }

    .pagination-container {
        background: transparent;
        margin-top: 0;
    }
}
</style>