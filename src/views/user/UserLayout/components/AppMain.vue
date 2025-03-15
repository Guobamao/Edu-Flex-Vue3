<template>
    <section class="app-main">
        <router-view v-slot="{ Component, route }">
            <transition name="fade-transform" mode="out-in">
                <component :is="Component" :key="route.path" />
            </transition>
        </router-view>
    </section>
</template>

<script setup>
</script>
<style lang="scss" scoped>
.app-main {
    min-height: calc(100vh - 60px);
    width: 80%;
    margin: 0 auto;
    margin-top: 60px;
    overflow-y: auto;
}
</style>