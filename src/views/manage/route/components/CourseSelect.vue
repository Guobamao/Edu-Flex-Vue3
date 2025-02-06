<template>
    <el-dialog :model-value="visible" title="选择课程" width="600px" append-to-body>
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="课程名称" prop="name">
                <el-input v-model="queryParams.name" placeholder="请输入课程名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>
        <el-row :gutter="10" class="mb8">
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
        <el-table v-loading="loading" :data="courseList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" :selectable="isSelectable" />
            <el-table-column label="序号" type="index" width="50" align="center" prop="id" />
            <el-table-column label="课程封面" align="center" width="100" prop="cover">
                <template #default="scope">
                    <img :src="scope.row.cover" width="50%" height="10%" />
                </template>
            </el-table-column>
            <el-table-column label="课程名称" align="center" width="150" prop="name" show-overflow-tooltip />
            <el-table-column label="任课老师" align="center" prop="teacherName" />
            <el-table-column label="课程分类" align="center" prop="categoryName" />
        </el-table>
        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize" @pagination="getList" />
        <template #footer>
            <div class="dialog-footer">
                <el-button type="primary" @click="submitForm">确 定</el-button>
                <el-button @click="cancel">取 消</el-button>
            </div>
        </template>
    </el-dialog>
</template>
<script setup name="CourseSelect">
import { listCourseForRoute } from "@/api/manage/course";

const { proxy } = getCurrentInstance();

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    routeId: {
        type: String,
    }
});

const emit = defineEmits(['update:visible', 'selectCourse'])

const courseList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const courseSelection = ref([]);

const data = reactive({
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        routeId: props.routeId,
        name: null,
    }
});

const { queryParams } = toRefs(data);

/** 查询课程列表 */
function getList() {
    loading.value = true;
    listCourseForRoute(queryParams.value).then(response => {
        courseList.value = response.rows;
        courseList.value.forEach(item => {
            item.cover = proxy.$previewUrl + item.cover
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

// 多选框选中数据
function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.id);
    courseSelection.value = selection;
    single.value = selection.length != 1;
    multiple.value = !selection.length;
}

// 提交
function submitForm() {
    emit('selectCourse', courseSelection.value, ids.value)
    emit('update:visible', false);
    resetQuery()
}

// 取消
function cancel() {
    emit('update:visible', false);
    resetQuery()
}

function isSelectable(row) {
    return !row.isSelected;
}
getList();
</script>

<style lang="scss" scoped>
:deep(.el-pagination) {
    margin-right: 10px;
}
</style>