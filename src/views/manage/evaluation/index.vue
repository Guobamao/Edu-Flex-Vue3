<template>
  <course-components>
    <template #extColumn>
      <el-table-column label="评价数" align="center" prop="evaluationNum" />
    </template>
    <template #action="{ row }">
      <el-button link type="primary" icon="View" @click="goToEvaluation(row)"
        v-hasRole="['admin', 'teacher']">查看评价</el-button>
    </template>
  </course-components>
</template>

<script setup>
import CourseComponents from '@/views/manage/course/components/CourseComponents.vue';

const router = useRouter();

// 跳转到评价
function goToEvaluation(row) {
  router.push("/admin/evaluations/" + row.id);
}

</script>
