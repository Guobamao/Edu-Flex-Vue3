<template>
    <div class="app-container">
        <div class="filter-container">
            <el-card>
                <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
                    <el-form-item label="课程名称" prop="courseId">
                        <el-select v-model="queryParams.courseId" placeholder="请选择课程" clearable filterable
                            @change="handleQuery" @clear="handleQuery" style="width: 200px;">
                            <el-option v-for="item in courseOptions" :key="item.id" :label="item.courseName"
                                :value="item.courseId" />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
        </div>
        <el-card>
            
        </el-card>
    </div>
</template>
<script setup name="UserHomeWork">
import { listStudentCourse } from "@/api/user/studentCourse";
import { listHomework } from "@/api/user/homework"

const { proxy } = getCurrentInstance();

const queryParams = ref({
    pageNum: 1,
    pageSize: 10,
    courseId: null,
})
const total = ref(0);

const courseOptions = ref([]);
const homeworkList = ref([]);

function getCourseList() {
    listStudentCourse(queryParams.value).then(response => {
        courseOptions.value = response.rows;
    });
}

function getList() {
    listHomework(queryParams.value).then(res => {
        homeworkList.value = res.rows;
        total.value = res.total;
    })
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

getCourseList();
getList();
</script>