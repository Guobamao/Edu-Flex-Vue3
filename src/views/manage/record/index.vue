<template>
  <course-components>
    <template #action="{ row }">
      <el-button link type="primary" icon="View" @click="goToStudentScore(row)"
        v-hasRole="['admin', 'teacher']">查看选课学生</el-button>
    </template>
  </course-components>
</template>

<script setup>
import CourseComponents from '@/views/manage/course/components/CourseComponents.vue';

const router = useRouter();

// 跳转到课程作业
function goToStudentScore(row) {
  const _courseId = row.id;
  router.push("/admin/comments/" + _courseId);
}

</script>
