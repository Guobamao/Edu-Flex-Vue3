<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="评分" prop="score">
                <el-rate v-model="queryParams.score" @change="handleQuery" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
            <div class="demo-progress">
                <div class="demo-progress-item">
                    <span class="label">5星</span>
                    <el-progress :percentage="statisticsList.fiveStarPercent" status="warning">
                        <template #default>
                            <span>{{ statisticsList.fiveStarNum }}</span>
                        </template>
                    </el-progress>
                </div>
                <div class="demo-progress-item">
                    <span class="label">4星</span>
                    <el-progress :percentage="statisticsList.fourStarPercent" status="warning">
                        <template #default>
                            <span>{{ statisticsList.fourStarNum }}</span>
                        </template>
                    </el-progress>
                </div>
                <div class="demo-progress-item">
                    <span class="label">3星</span>
                    <el-progress :percentage="statisticsList.threeStarPercent" status="warning">
                        <template #default>
                            <span>{{ statisticsList.threeStarNum }}</span>
                        </template>
                    </el-progress>
                </div>
                <div class="demo-progress-item">
                    <span class="label">2星</span>
                    <el-progress :percentage="statisticsList.twoStarPercent" status="warning">
                        <template #default>
                            <span>{{ statisticsList.twoStarNum }}</span>
                        </template>
                    </el-progress>
                </div>
                <div class="demo-progress-item">
                    <span class="label">1星</span>
                    <el-progress :percentage="statisticsList.oneStarPercent" status="warning">
                        <template #default>
                            <span>{{ statisticsList.oneStarNum }}</span>
                        </template>
                    </el-progress>
                </div>
            </div>
        </el-form>

        <el-row :gutter="10" class="mb8 mt20">
            <el-col :span="1.5">
                <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
                    v-hasRole="['admin']">删除</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="warning" plain icon="Download" @click="handleExport"
                    v-hasRole="['admin']">导出</el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="evaluationList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="序号" type="index" width="50" align="center" />
            <el-table-column label="用户" align="center" prop="userName">
                <template #default="scope">
                    {{ scope.row.nickName }}({{ scope.row.userName }})
                </template>
            </el-table-column>
            <el-table-column label="课程" align="center" prop="courseName" />
            <el-table-column label="评分" align="center" prop="score">
                <template #default="scope">
                    <el-rate v-model="scope.row.score" disabled />
                </template>
            </el-table-column>
            <el-table-column label="评论" align="center" prop="content" />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                        v-hasRole="['admin']">修改</el-button>
                    <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                        v-hasRole="['admin']">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize" @pagination="getList" />

        <!-- 添加或修改课程评价管理对话框 -->
        <el-dialog :title="title" v-model="open" width="500px" append-to-body>
            <el-form ref="evaluationRef" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="课程" prop="courseId">
                    <el-select v-model="form.courseId" placeholder="请选择课程">
                        <el-option v-for="item in courseList" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="评分" prop="score">
                    <el-rate v-model="form.score" />
                </el-form-item>
                <el-form-item label="评论">
                    <el-input v-model="form.content" type="textarea" placeholder="请输入评论" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button type="primary" @click="submitForm">确 定</el-button>
                    <el-button @click="cancel">取 消</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup name="Evaluation">
import { listEvaluation, getEvaluation, delEvaluation, addEvaluation, updateEvaluation, statistics } from "@/api/manage/evaluation";
import { listCourse } from "@/api/manage/course";
import { loadAllParams } from "@/api/page"

const { proxy } = getCurrentInstance();

const route = useRoute();

const evaluationList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const courseList = ref([]);
const statisticsList = ref([]);

const data = reactive({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        score: null,
        courseId: route.params.courseId,
    },
    rules: {
        score: [
            { required: true, message: "评分不能为空", trigger: "blur" }
        ],
        content: [
            { required: true, message: "评论不能为空", trigger: "blur" }
        ],
        courseId: [
            { required: true, message: "课程不能为空", trigger: "blur" }
        ],
    }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询课程评价管理列表 */
function getList() {
    loading.value = true;
    if (queryParams.value.score === 0) {
        queryParams.value.score = null;
    }
    listEvaluation(queryParams.value).then(response => {
        evaluationList.value = response.rows;
        total.value = response.total;
        loading.value = false;
    });
    statistics(queryParams.value.courseId).then(res => {
        statisticsList.value = res.data
        statisticsList.value.oneStarNum = statisticsList.value.oneStarNum ? statisticsList.value.oneStarNum : 0
        statisticsList.value.twoStarNum = statisticsList.value.twoStarNum ? statisticsList.value.twoStarNum : 0
        statisticsList.value.threeStarNum = statisticsList.value.threeStarNum ? statisticsList.value.threeStarNum : 0
        statisticsList.value.fourStarNum = statisticsList.value.fourStarNum ? statisticsList.value.fourStarNum : 0
        statisticsList.value.fiveStarNum = statisticsList.value.fiveStarNum ? statisticsList.value.fiveStarNum : 0

        const maxNum = Math.max(statisticsList.value.oneStarNum, statisticsList.value.twoStarNum, statisticsList.value.threeStarNum, statisticsList.value.fourStarNum, statisticsList.value.fiveStarNum)

        statisticsList.value.oneStarPercent = statisticsList.value.oneStarNum / maxNum * 100
        statisticsList.value.twoStarPercent = statisticsList.value.twoStarNum / maxNum * 100
        statisticsList.value.threeStarPercent = statisticsList.value.threeStarNum / maxNum * 100
        statisticsList.value.fourStarPercent = statisticsList.value.fourStarNum / maxNum * 100
        statisticsList.value.fiveStarPercent = statisticsList.value.fiveStarNum / maxNum * 100
    })
}

// 取消按钮
function cancel() {
    open.value = false;
    reset();
}

// 表单重置
function reset() {
    form.value = {
        id: null,
        score: null,
        content: null,
        courseId: null,
    };
    proxy.resetForm("evaluationRef");
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
    single.value = selection.length != 1;
    multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
    reset();
    open.value = true;
    title.value = "添加课程评价管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
    reset();
    const _id = row.id || ids.value
    getEvaluation(_id).then(response => {
        form.value = response.data;
        open.value = true;
        title.value = "修改课程评价管理";
    });
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs["evaluationRef"].validate(valid => {
        if (valid) {
            if (form.value.id != null) {
                updateEvaluation(form.value).then(response => {
                    proxy.$modal.msgSuccess("修改成功");
                    open.value = false;
                    getList();
                });
            } else {
                addEvaluation(form.value).then(response => {
                    proxy.$modal.msgSuccess("新增成功");
                    open.value = false;
                    getList();
                });
            }
        }
    });
}

/** 删除按钮操作 */
function handleDelete(row) {
    const _ids = row.id || ids.value;
    proxy.$modal.confirm('是否确认删除课程评价管理编号为"' + _ids + '"的数据项？').then(function () {
        return delEvaluation(_ids);
    }).then(() => {
        getList();
        proxy.$modal.msgSuccess("删除成功");
    }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
    proxy.download('manage/evaluation/export', {
        ...queryParams.value
    }, `evaluation_${new Date().getTime()}.xlsx`)
}

/** 获取课程列表 */
function getCourseList() {
    listCourse(loadAllParams).then(res => {
        courseList.value = res.rows
    })
}

getCourseList();
getList();
</script>
<style lang="scss" scoped>
.app-container {
    .demo-progress {
        position: absolute;
        width: 230px;
        height: 110px;
        right: 10%;
        top: 3%;

        .demo-progress-item {
            display: flex;

            .label {
                margin-right: 8px;
            }

            .el-progress {
                flex: 1;
            }
        }
    }
}
</style>