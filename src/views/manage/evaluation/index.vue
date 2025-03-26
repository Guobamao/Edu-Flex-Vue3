<template>
  <course-components>
    <template #action="{ row }">
      <el-button link type="primary" icon="View" @click="goToEvaluation(row)"
        v-hasRole="['admin', 'teacher']">查看评价</el-button>
    </template>
  </course-components>
</template>

<script setup>
import CourseComponents from '@/views/manage/course/components/CourseComponents.vue';

const router = useRouter();

// 跳转到学生选课
function goToEvaluation(row) {
  const _courseId = row.id;
  router.push("/admin/evaluations/" + _courseId);
}

</script>
