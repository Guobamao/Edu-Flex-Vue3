<template>
  <el-select
    v-model="currentValue"
    placeholder="请选择题库"
    filterable
    clearable
    @change="handleChange"
    @clear="handleClear">
    <el-option v-for="item in repoOptions" :key="item.id" :label="item.name" :value="item.id" />
  </el-select>
</template>
<script setup name="RepoSelect">
import { listRepo } from "@/api/manage/repo";
import { loadAllParams } from "@/api/page";

const props = defineProps({
  courseId: {
    type: String,
  },
  modelValue: {
    type: [String, Number],
  },
  index: {
    type: Number,
  },
});

const emit = defineEmits(["update:modelValue", "change", "clear"]);

const repoOptions = ref([]);
const currentValue = ref(props.modelValue || "");

watch(
  () => props.modelValue,
  (val) => {
    currentValue.value = val;
  }
);

function getRepoList() {
  listRepo({
    ...loadAllParams,
    courseId: props.courseId,
  }).then((res) => {
    repoOptions.value = res.rows;
  });
}

function handleChange(value) {
  emit("update:modelValue", value);
  emit("change", value, props.index);
}

function handleClear() {
  emit("update:modelValue", null);
  emit("clear", props.index); // 通知父组件清空
}

onMounted(() => {
  getRepoList();
});
</script>
