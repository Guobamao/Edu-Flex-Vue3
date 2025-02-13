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
        </el-card>
    </div>
</template>

<script setup name="UserIndex">
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
    border-bottom: 1px solid #eee       ;
}
</style>