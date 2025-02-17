<template>
    <div>
        <el-dialog v-model="visible" width="500" @close="handleClose" :show-close="false">
            <el-input v-model="searchValue" placeholder="搜索内容，回车跳转" @keyup.enter="onSearch" class="search-input" />
        </el-dialog>
    </div>
</template>
<script setup name="SearchDialog">

const router = useRouter()

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
    get() {
        return props.modelValue
    },
    set(newValue) {
        emit('update:modelValue', newValue)
    }
})
const searchValue = ref('')

function handleClose() {
    visible.value = false
}

function onSearch() {
    router.push({ name: 'UserSearch', query: { query: searchValue.value } })
    visible.value = false
    searchValue.value = ''
}
</script>

<style lang="scss" scoped>
:deep(.el-overlay) {
    background-color: rgba(0, 0, 0, .3);
}

:deep(.el-dialog) {
    margin-top: 20vh !important;
    padding: 0;

    .el-dialog__header {
        padding-bottom: 0;
    }
}

.search-input {
    height: 60px;
    font-size: 18px;
}
</style>