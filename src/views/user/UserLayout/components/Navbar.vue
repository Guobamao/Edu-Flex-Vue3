<template>
    <div class="navbar">
        <el-menu default-active="/index" mode="horizontal" :ellipsis="false" router>
            <el-menu-item index="/">学智灵云课堂</el-menu-item>
            <el-menu-item index="/index">首页</el-menu-item>
            <el-menu-item index="/course">课程</el-menu-item>
            <el-menu-item index="/exam">考试</el-menu-item>

            <div class="flex-grow" />
            <el-menu-item index="4">搜索</el-menu-item>
            <el-sub-menu v-if="isLogin">
                <template #title>
                    {{ userStore.nickName }}
                </template>
                <el-menu-item index="/user">我的主页</el-menu-item>
                <el-menu-item @click="logout">注销</el-menu-item>
            </el-sub-menu>
            <el-menu-item index="/login" v-if="!isLogin">登录</el-menu-item>
            <el-menu-item index="/register" v-if="!isLogin">注册</el-menu-item>
        </el-menu>
    </div>
</template>
<script setup>
import useAppStore from '@/store/modules/app'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'

import { getToken } from "@/utils/auth"

const { proxy } = getCurrentInstance();

const userStore = useUserStore()

const isLogin = computed(() => getToken())

function logout() {
    proxy.$modal.confirm('确定注销并退出系统吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        userStore.logOut().then(() => {
            location.href = '/index';
        })
    }).catch(() => { });
}
</script>

<style lang="scss" scoped>
.flex-grow {
    flex-grow: 1;
}

.navbar {
    height: 60px;
}
</style>