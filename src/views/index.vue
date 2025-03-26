<template>
    <div class="app-container">
        <el-row :gutter="20">
            <el-col :span="6">
                <el-card shadow="hover">
                    <div class="stat-item">
                        <svg-icon icon-class="student" class-name="icon" />
                        <div>
                            <h3>学生人数</h3>
                            <p>{{ stats.studentCount }}</p>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover">
                    <div class="stat-item">
                        <svg-icon icon-class="teacher" class-name="icon" />
                        <div>
                            <h3>教师人数</h3>
                            <p>{{ stats.teacherCount }}</p>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover">
                    <div class="stat-item">
                        <svg-icon icon-class="course" class-name="icon" />
                        <div>
                            <h3>课程总数</h3>
                            <p>{{ stats.courseCount }}</p>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover">
                    <div class="stat-item">
                        <svg-icon icon-class="resource" class-name="icon" />
                        <div>
                            <h3>资源总数</h3>
                            <p>{{ stats.resourceCount }}</p>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <el-row :gutter="20" class="mt20">
            <el-col :span="12">
                <div ref="topCourseChart" style="height: 400px;" />
            </el-col>
            <el-col :span="12">
                <div ref="trendChart" style="height: 400px;" />
            </el-col>
        </el-row>
    </div>
</template>
<script setup name="DashBoard">
import { getStats, getTopCourses, getTrend } from "@/api/manage/dashboard";
import * as echarts from 'echarts';

const topCourseChart = ref();
const trendChart = ref();
const stats = ref({});

onMounted(() => {
    getStats().then(res => {
        stats.value = res.data;
    });
    getTopCourses().then(res => {
        const xData = res.data.map(item => item.courseName);
        const yData = res.data.map(item => item.count);
        const chart = echarts.init(topCourseChart.value);
        const option = {
            title: {
                text: '热门课程'
            },
            tooltip: {
                appendTo: 'body',
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            xAxis: {
                type: 'category',
                data: xData,
                name: '课程名称',
                nameLocation: 'end',
                inverse: false,
                axisLabel: {
                    show: true,
                    rotate: 0,
                    interval: 0,
                }
            },
            yAxis: {
                type: 'value',
                name: '选课人数',
            },
            series: [{
                name: '选课人数',
                data: yData,
                type: 'bar',
                label: {
                    show: true,
                    position: 'top',
                }
            }]
        };
        chart.setOption(option);
    });
    getTrend().then(res => {
        const xData = res.data.map(item => item.date);
        const yData = res.data.map(item => item.count);
        const chart = echarts.init(trendChart.value);
        const option = {
            title: {
                text: '选课趋势'
            },
            tooltip: {
                appendTo: 'body',
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            xAxis: {
                type: 'category',
                data: xData,
                name: '日期',
                nameLocation: 'end',
                inverse: false,
                axisLabel: {
                    show: true,
                    rotate: 0,
                }
            },
            yAxis: {
                type: 'value',
                name: '选课记录',
            },
            series: [{
                name: '选课记录',
                data: yData,
                type: 'line',
                label: {
                    show: true,
                    position: 'top',
                },
                smooth: true,
            }]
        };
        chart.setOption(option);
    })
});
</script>
<style lang="scss" scoped>
.stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: center;

    .icon {
        font-size: 2em;
    }
}

.stat-item h3 {
    margin: 0;
    font-size: 16px;
    color: #666;
}

.stat-item p {
    margin: 10px 0 0;
    font-size: 24px;
    font-weight: bold;
}
</style>