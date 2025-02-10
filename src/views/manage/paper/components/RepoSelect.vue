<template>
    <el-select v-model="currentValue" placeholder="请选择题库" filterable clearable>
        <el-option v-for="item in repoOptions" :key="item.id" :label="item.name" :value="item.id" />
    </el-select>
</template>
<script setup name="RepoSelect">
import { listRepo } from '@/api/manage/repo';
import { loadAllParams } from '@/api/page';

const props = defineProps({
    excludes: {
        type: Array
    }
})
const emit = defineEmits(['change'])

const repoOptions = ref([]);
const currentValue = ref('');

function getRepoList() {
    listRepo({
        ...loadAllParams,
        excludes: props.excludes
    }).then(res => {
        repoOptions.value = res.rows
    })
}

onMounted(() => {
    getRepoList()
})
</script>