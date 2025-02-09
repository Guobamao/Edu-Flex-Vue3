<template>
    <div class="app-container">
        <h3>组卷信息</h3>
        <el-card>
            <el-row :gutter="10" class="mb8" justify="space-between">
                <el-col :span="1.5">
                    <el-button type="primary" icon="Plus" @click="handleRepoAdd">添加题库</el-button>
                </el-col>
                <el-col :span="4">
                    <span>试卷总分：100</span>
                </el-col>
            </el-row>
            <el-table :data="repoList" empty-text="请点击上面的`添加题库`进行设置">
                <el-table-column label="题库名称">
                    <template #default="scope">
                        <el-select v-model="scope.row.repoId" placeholder="请选择题库" filterable clearable>
                            <el-option v-for="item in repoOptions" :key="item.id" :label="item.name" :value="item.id" />
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column label="单选题数量" align="center" width="130">
                    <template #default="scope">
                        <el-input-number v-model="scope.row.singleChoiceCount" :min="0" :max="10" :controls="false"
                            style="width: 50px;" />
                        /
                        16
                    </template>
                </el-table-column>
                <el-table-column label="分值" align="center" width="80">
                    <template #default="scope">
                        <el-input-number v-model="scope.row.singleChoiceScore" :min="0" :max="10" :controls="false"
                            style="width: 50px;" />
                    </template>
                </el-table-column>
                <el-table-column label="多选题数量" align="center" width="130">
                    <template #default="scope">
                        <el-input-number v-model="scope.row.multipleChoiceCount" :min="0" :max="10" :controls="false"
                            style="width: 50px;" />
                        /
                        16
                    </template>
                </el-table-column>
                <el-table-column label="分值" align="center" width="80">
                    <template #default="scope">
                        <el-input-number v-model="scope.row.multipleChoiceScore" :min="0" :max="10" :controls="false"
                            style="width: 50px;" />
                    </template>
                </el-table-column>
                <el-table-column label="判断题数量" align="center" width="130">
                    <template #default="scope">
                        <el-input-number v-model="scope.row.judgeCount" :min="0" :max="10" :controls="false"
                            style="width: 50px;" />
                        /
                        16
                    </template>
                </el-table-column>
                <el-table-column label="分值" align="center" width="80">
                    <template #default="scope">
                        <el-input-number v-model="scope.row.judgeScore" :min="0" :max="10" :controls="false"
                            style="width: 50px;" />
                    </template>
                </el-table-column>
                <el-table-column label="填空题数量" align="center" width="130">
                    <template #default="scope">
                        <el-input-number v-model="scope.row.blankCount" :min="0" :max="10" :controls="false"
                            style="width: 50px;" />
                        /
                        16
                    </template>
                </el-table-column>
                <el-table-column label="分值" align="center" width="80">
                    <template #default="scope">
                        <el-input-number v-model="scope.row.blankScore" :min="0" :max="10" :controls="false"
                            style="width: 50px;" />
                    </template>
                </el-table-column>
                <el-table-column label="简答题数量" align="center" width="130">
                    <template #default="scope">
                        <el-input-number v-model="scope.row.shortAnswerCount" :min="0" :max="10" :controls="false"
                            style="width: 50px;" />
                        /
                        16
                    </template>
                </el-table-column>
                <el-table-column label="分值" align="center" width="80">
                    <template #default="scope">
                        <el-input-number v-model="scope.row.shortAnswerScore" :min="0" :max="10" :controls="false"
                            style="width: 50px;" />
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="80">
                    <template #default="scope">
                        <el-button type="danger" link icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script setup>
import { loadAllParams } from '@/api/page';
import { listRepo } from '@/api/manage/repo';

const { proxy } = getCurrentInstance();

const repoList = ref([]);
const repoOptions = ref([]);

function handleRepoAdd() {
    repoList.value.push({
        repoId: null,
        singleChoiceCount: 0,
        singleChoiceScore: 0,
        multipleChoiceCount: 0,
        multipleChoiceScore: 0,
        judgeCount: 0,
        judgeScore: 0,
        blankCount: 0,
        blankScore: 0,
        shortAnswerCount: 0,
        shortAnswerScore: 0
    })
}

function handleDelete(row) {
    const index = repoList.value.indexOf(row);
    repoList.value.splice(index, 1);
}

function getRepoList() {
    listRepo(loadAllParams).then(res => {
        repoOptions.value = res.rows
    })
}
getRepoList()

</script>

<style scoped>
.app-container {
    display: flex;
    flex-direction: column;
    padding: 20px;
}
</style>