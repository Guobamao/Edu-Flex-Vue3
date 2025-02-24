<template>
    <div class="app-container">
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/profile' }">个人中心</el-breadcrumb-item>
            <el-breadcrumb-item>我的学习目标</el-breadcrumb-item>
        </el-breadcrumb>
        <el-row :gutter="20" justify="center" class="mt20">
            <el-col :xs="24" :sm="24" :md="8" :lg="6" :xl="4">
                <el-card class="mb20 text-center">
                    <div>
                        <el-avatar :size="92" :src="userInfo.avatar" />
                    </div>
                    <div>
                        <span class="username">{{ userInfo.nickName }}({{ userInfo.userName }})</span>
                    </div>
                </el-card>
                <el-card class="mb20">
                    <template #header>
                        <span>课程中心</span>
                    </template>
                    <div class="course-card">
                        <el-link type="info" :underline="false">我的课程</el-link>
                        <el-link type="info" :underline="false">我的评论</el-link>
                    </div>
                </el-card>
                <el-card class="mb20">
                    <template #header>
                        <span>个人设置</span>
                    </template>
                    <div class="course-card">
                        <el-link type="info" :underline="false">个人主页</el-link>
                        <el-link type="info" :underline="false">我的评论</el-link>
                    </div>
                </el-card>
            </el-col>
            <el-col :xs="24" :sm="24" :md="16" :lg="18" :xl="18">
                <el-card></el-card>
            </el-col>
        </el-row>
    </div>
</template>
<script setup name="UserGoalIndex">
import { getUserProfile } from "@/api/user/student";
import { parseTime } from '@/utils/ruoyi'
import useUserStore from '@/store/modules/user'

const { proxy } = getCurrentInstance();
const router = useRouter();
const userStore = useUserStore()
const userInfo = ref({})

function getUser() {
    getUserProfile().then(res => {
        userInfo.value = res.data;
        userInfo.value.avatar = proxy.$previewUrl + userInfo.value.avatar;
        userInfo.value.loginDate = parseTime(userInfo.value.loginDate, '{y}-{m}-{d} {h}:{i}:{s}');
    });
};

document.title = '我的学习目标 - 学智灵云课堂';

getUser();
</script>
<style lang="scss" scoped>
.app-container {
    .username {
        font-size: 15px;
    }

    .course-card {
        display: flex;
        flex-direction: column;
    }
}
</style>