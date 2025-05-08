<template>
    <div class="app-container">
        <el-card class="mb20">
            <el-carousel height="300px">
                <el-carousel-item v-for="item in carouselList" :key="item">
                    <el-image :src="item" style="width: 100%; height: 300px;"></el-image>
                </el-carousel-item>
            </el-carousel>
        </el-card>
        <el-card class="mb20">
            <h3 class="section-title">推荐课程</h3>
            <el-tabs v-model="activeTab1" @tab-click="handleTab1Click">
                <el-tab-pane v-for="item in directionOptions" :key="item.id" :label="item.name" :name="item.id">
                    <el-row :gutter="20">
                        <template v-if="recommendCourseOptions.length > 0">
                            <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6" v-for="item in recommendCourseOptions"
                                :key="item.id">
                                <el-card shadow="hover" class="course-card">
                                    <dict-tag :options="common_status" :value="item.status" class="course-status" />
                                    <el-link :underline="false" @click="handleRouterPush(item.id)"
                                        style="width: 100%; overflow: hidden">
                                        <el-image :src="item.cover" style="width: 100%; height: 150px;"
                                            class="course-cover" />
                                    </el-link>
                                    <div class="info">
                                        <div class="title">
                                            <el-link :underline="false"
                                                @click="handleRouterPush(item.id)">{{ item.name }}</el-link>
                                        </div>
                                        <div class="meta">
                                            <span class="teacherName">讲师: {{ item.teacherName }}</span>
                                            <span class="videoNum">{{ item.videoNum }} 节课</span>
                                            <span class="selectedNum">{{ item.selectedNum }} 人已选</span>
                                        </div>
                                    </div>
                                </el-card>
                            </el-col>
                        </template>
                        <template v-else>
                            <el-col :span="24">
                                <el-empty description="暂无课程" />
                            </el-col>
                        </template>
                    </el-row>
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <el-card class="mb20">
            <h3 class="section-title">新上课程</h3>
            <el-tabs v-model="activeTab2" @tab-click="handleTab2Click">
                <el-tab-pane v-for="item in directionOptions" :key="item.id" :label="item.name" :name="item.id">
                    <el-row :gutter="20">
                        <template v-if="newCourseOptions.length > 0">
                            <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6" v-for="item in newCourseOptions"
                                :key="item.id">
                                <el-card shadow="hover" class="course-card">
                                    <dict-tag :options="common_status" :value="item.status" class="course-status" />
                                    <el-link :underline="false" @click="handleRouterPush(item.id)"
                                        style="width: 100%; overflow: hidden">
                                        <el-image :src="item.cover" style="width: 100%; height: 150px;"
                                            class="course-cover" />
                                    </el-link>
                                    <div class="info">
                                        <div class="title">
                                            <el-link :underline="false"
                                                @click="handleRouterPush(item.id)">{{ item.name }}</el-link>
                                        </div>
                                        <div class="meta">
                                            <span class="teacherName">讲师: {{ item.teacherName }}</span>
                                            <span class="videoNum">{{ item.videoNum }} 节课</span>
                                            <span class="selectedNum">{{ item.selectedNum }} 人已选</span>
                                        </div>
                                    </div>
                                </el-card>
                            </el-col>
                        </template>
                        <template v-else>
                            <el-col :span="24">
                                <el-empty description="暂无课程" />
                            </el-col>
                        </template>
                    </el-row>
                </el-tab-pane>
            </el-tabs>
        </el-card>
    </div>
</template>

<script setup name="UserIndex">
import { listDirection } from "@/api/user/direction";
import { listCourse } from "@/api/user/course";
import { listCarousel } from "@/api/user/carousel";

const { proxy } = getCurrentInstance();
const { common_status } = proxy.useDict('common_status')

const router = useRouter();

const directionOptions = ref([]);
const recommendCourseOptions = ref([]);
const newCourseOptions = ref([]);
const activeTab1 = ref('');
const activeTab2 = ref('');
const carouselList = ref([]);

function getList() {
    const params = {
        pageNum: 1,
        pageSize: 5,
        status: 1
    };
    listDirection(params).then(res => {
        directionOptions.value = res.rows;
        activeTab1.value = directionOptions.value[0].id
        activeTab2.value = directionOptions.value[0].id
        getCourseList(directionOptions.value[0].id, 'recommend')
        getCourseList(directionOptions.value[0].id, 'new')
    });
    listCarousel().then(res => {
        carouselList.value = res.data.imgIds.split(",").map(item => proxy.$previewUrl + item);
    })
}

function getCourseList(id, type) {
    const params = {
        directionId: id,
        type: type,
        pageNum: 1,
        pageSize: 8
    }
    listCourse(params).then(res => {
        if (type == 'recommend') {
            recommendCourseOptions.value = res.rows;
            recommendCourseOptions.value.forEach(item => {
                item.cover = proxy.$previewUrl + item.cover
            })
        } else {
            newCourseOptions.value = res.rows;
            newCourseOptions.value.forEach(item => {
                item.cover = proxy.$previewUrl + item.cover
            })
        }
    })
}

function handleTab1Click(tab, event) {
    const id = tab.props.name
    getCourseList(id, 'recommend')
}

function handleTab2Click(tab, event) {
    const id = tab.props.name
    getCourseList(id, 'new')
}

function handleRouterPush(courseId) {
    router.push({ name: 'UserCourseDetail', params: { courseId: courseId } });
}

document.title = '学智灵云课堂'
getList();
</script>

<style lang="scss" scoped>
.el-carousel__item h3 {
    color: #475669;
    opacity: 0.75;
    line-height: 150px;
    margin: 0;
    text-align: center;
}

.el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
    background-color: #d3dce6;
}

.section-title {
    text-align: center;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
}

.course-card {
    margin-bottom: 20px;
    position: relative;

    :deep(.el-card__body) {
        padding: 0 !important;

        .el-link__inner {
            flex: 1;
        }
    }

    .course-status {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 1;
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
</style>