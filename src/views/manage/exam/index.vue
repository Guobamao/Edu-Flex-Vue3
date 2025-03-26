<template>
  <course-components>
    <template #action="{ row }">
      <el-button link type="primary" icon="View" @click="goToExam(row)"
        v-hasRole="['admin', 'teacher']">查看考试</el-button>
    </template>
  </course-components>
</template>

<script setup>
import CourseComponents from '@/views/manage/course/components/CourseComponents.vue';

const router = useRouter();

// 跳转到课程题库
function goToExam(row) {
  const _courseId = row.id;
  router.push("/admin/exams/exams/" + _courseId);
}

</script>
