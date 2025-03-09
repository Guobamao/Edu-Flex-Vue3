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

const route = useRoute()

const key = computed(() => {
    return route.path + Math.random()
})

</script>
<style lang="scss" scoped>
.app-main {
    min-height: calc(100vh - 120px);
    width: 80%;
    margin: 0 auto;
    margin-top: 60px;
    position: relative;
    overflow-y: auto;
}
</style>