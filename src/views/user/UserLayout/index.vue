<template>
    <div class="app-wrapper">
        <el-container>
            <el-header class="fixed-header">
                <Navbar />
            </el-header>

            <AppMain />
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
    padding: 0;
    z-index: 10;
}

.app-main {
    padding: 0;
}
</style>