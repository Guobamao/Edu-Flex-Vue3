<template>
    <div class="navbar">
        <el-menu :default-active="defaultActive" mode="horizontal" :ellipsis="false" router background-color="#393D49" text-color="#fff">
            <el-menu-item index="/">
                <img style="width: 100px" src="@/assets/logo/logo.png" />
            </el-menu-item>
            <el-menu-item index="/index">首页</el-menu-item>
            <el-menu-item index="/course">课程</el-menu-item>
            <el-menu-item index="/homework" v-if="isLogin">作业</el-menu-item>

            <div class="flex-grow" />
            <el-menu-item @click="handleSearch">搜索</el-menu-item>
            <el-sub-menu v-if="isLogin">
                <template #title>
                    <img :src="userStore.avatar" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 5px;" />
                    {{ userStore.nickName }}
                </template>
                <el-menu-item index="/profile">我的主页</el-menu-item>
                <el-menu-item @click="logout">退出登录</el-menu-item>
            </el-sub-menu>
            <el-menu-item index="/login" v-if="!isLogin">登录</el-menu-item>
            <el-menu-item index="/register" v-if="!isLogin">注册</el-menu-item>
        </el-menu>

        <Search v-model:modelValue="dialogVisible" @close="dialogVisible = false" />
    </div>
</template>
<script setup>
import useUserStore from '@/store/modules/user'
import Search from './Search.vue';

import { getToken } from "@/utils/auth"

const { proxy } = getCurrentInstance();

const userStore = useUserStore()

const isLogin = computed(() => getToken())

const defaultActive = computed(() => {
    const path = location.pathname
    const match = path.match(/^\/[^\/]+/)
    return match ? match[0] : path
})

const dialogVisible = ref(false)
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

function handleSearch() {
    dialogVisible.value = true
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