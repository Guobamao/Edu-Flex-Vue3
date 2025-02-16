<template>
    <div class="app-wrapper">
        <el-container>
            <div class="fixed-header">
                <Navbar />
            </div>
            <AppMain />
            <el-footer></el-footer>
        </el-container>
    </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue';
import AppMain from './components/AppMain.vue';
</script>

<style lang="scss" scoped>
.app-wrapper {
    background-color: #F2F2F2;
}
.fixed-header {
    position: fixed;
    width: 100%;
    z-index: 10;
}
</style>