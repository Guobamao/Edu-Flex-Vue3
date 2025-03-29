<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px"
            @submit.prevent>
            <el-form-item label="登录名" prop="userName">
                <el-input v-model="queryParams.userName" placeholder="请输入学生登录名" clearable @keyup.enter="handleQuery"
                    @clear="handleQuery" />
            </el-form-item>
            <el-form-item label="姓名" prop="nickName">
                <el-input v-model="queryParams.nickName" placeholder="请输入学生姓名" clearable @keyup.enter="handleQuery"
                    @clear="handleQuery" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="studentList">
            <el-table-column label="序号" type="index" width="50" align="center" prop="id" />
            <el-table-column label="头像" align="center">
                <template #default="scope">
                    <img style="width: 40px; height: 40px" :src="scope.row.avatar"
                        @click="handlePreview(scope.row.avatar)" />
                </template>
            </el-table-column>
            <el-table-column label="登录名" align="center" prop="userName" />
            <el-table-column label="学生姓名" align="center" prop="nickName" />
            <el-table-column label="手机号码" align="center" prop="phonenumber" />
            <el-table-column label="邮箱" align="center" prop="email" />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="300">
                <template #default="scope">
                    <slot name="action" :row="scope.row"></slot>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize" @pagination="getList" />

        <!-- 图片预览 -->
        <div>
            <el-image-viewer hide-on-click-modal @close="() => { showViewer = false }" v-if="showViewer"
                :url-list="previewList" />
        </div>
    </div>
</template>

<script setup name="Student">
import { listStudent } from "@/api/manage/student";

const { proxy } = getCurrentInstance();

const studentList = ref([]);

const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const title = ref("");

const showViewer = ref(false);
const previewList = ref([])

const data = reactive({
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        userName: null,
        nickName: null
    },
});

const { queryParams } = toRefs(data);

/** 查询学生管理列表 */
function getList() {
    loading.value = true;
    listStudent(queryParams.value).then(response => {
        studentList.value = response.rows;
        studentList.value.forEach(item => {
            item.avatar = proxy.$previewUrl + item.avatar;
        })
        total.value = response.total;
        loading.value = false;
    });
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

/** 删除按钮操作 */
function handleDelete(row) {
    const _ids = row.id || ids.value;
    proxy.$modal.confirm('是否确认删除学生管理编号为"' + _ids + '"的数据项？').then(function () {
        return delStudent(_ids);
    }).then(() => {
        getList();
        proxy.$modal.msgSuccess("删除成功");
    }).catch(() => { });
}

// 预览图片
function handlePreview(url) {
    previewList.value = [url]
    showViewer.value = true
}

getList();
</script>