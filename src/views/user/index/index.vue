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
                <el-tab-pane v-for="item in directionOptions" :key="item.id" :label="item.name"
                    :name="item.name">
                    <el-row :gutter="20">
                        <el-col :span="4" v-for="item in courseOptions" :key="item.id">
                            <el-card shadow="hover" class="mb20">
                                <el-image :src="item.cover" fit="cover" style="height: 200px;"></el-image>
                                <div class="justify-between">
                                    <div class="flex-x-between"></div>
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
import { listCourse } from "@/api/user/course";

const { proxy } = getCurrentInstance();

const directionOptions = ref([]);
const courseOptions = ref([]);

function getList() {
    const params = {
        pageNum: 1,
        pageSize: 5,
        status: 1
    }
    listDirection(params).then(res => {
        directionOptions.value = res.data;
    })
}

function handleTabClick(tab, event) {
    console.log(tab)
    console.log(event)
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
</style>