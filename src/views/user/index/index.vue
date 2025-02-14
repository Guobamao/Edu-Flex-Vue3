<template>
    <div class="app-container">
        <el-card class="mb20">
            <el-carousel height="300px">
                <el-carousel-item v-for="item in 4" :key="item">
                    <h3 class="small justify-center" text="2xl">{{ item }}</h3>
                </el-carousel-item>
            </el-carousel>
        </el-card>
        <el-card>
            <h3 class="section-title">推荐课程</h3>
            <el-tabs v-model="activeTab" @tab-click="handleTabClick">
                <el-tab-pane v-for="item in directionOptions" :key="item.id" :label="item.name" :name="item.id">
                    <el-row :gutter="20">
                        <el-col :span="6" v-for="item in courseOptions" :key="item.id">
                            <el-card shadow="hover" class="course-card">
                                <el-link :href="'/course/' + item.id" :underline="false" style="width: 100%;">
                                    <el-image :src="item.cover" style="width: 100%; height: 150px;" />
                                </el-link>
                                <div class="info">
                                    <div class="title">{{ item.name }}</div>
                                    <div class="meta">
                                        <span class="teacher">教师：{{ item.teacherName }}</span>
                                        <span class="category">分类：{{ item.categoryName }}</span>
                                    </div>
                                </div>
                            </el-card>
                        </el-col>
                    </el-row>
                </el-tab-pane>
            </el-tabs>
        </el-card>
    </div>
</template>

<script setup name="UserIndex">
import { listDirection } from "@/api/user/direction";
import { listCourseByDirectionId } from "@/api/user/course";

const { proxy } = getCurrentInstance();

const directionOptions = ref([]);
const courseOptions = ref([]);
const activeTab = ref('')

function getList() {
    const params = {
        pageNum: 1,
        pageSize: 5,
        status: 1
    }
    listDirection(params).then(res => {
        directionOptions.value = res.data;
        activeTab.value = directionOptions.value[0].id
        getCourseList(directionOptions.value[0].id)
    })
}

function getCourseList(id) {
    listCourseByDirectionId(id).then(res => {
        courseOptions.value = res.data;
        courseOptions.value.forEach(item => {
            item.cover = proxy.$previewUrl + item.cover
        })
    })
}

function handleTabClick(tab, event) {
    const id = tab.props.name
    getCourseList(id)
}

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
    :deep(.el-card__body) {
        padding: 0 !important;

        .el-link__inner {
            flex: 1;
        }
    }

    .info {
        padding: 10px;
        padding-bottom: 18px;
    }
}
</style>