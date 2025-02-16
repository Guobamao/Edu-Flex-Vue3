<template>
    <section class="app-main">
        <router-view />
    </section>
</template>

<style lang="scss" scoped>
.app-main {
    min-height: calc(100vh - 60px);
    width: 80%;
    margin: 0 auto;
    margin-top: 60px;
    position: relative;
    overflow-y: auto;
}
</style>