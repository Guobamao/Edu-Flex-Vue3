<template>
  <course-components>
    <template #extColumn>
      <el-table-column label="题库数" align="center" prop="repoNum" />
    </template>
    <template #action="{ row }">
      <el-button link type="primary" icon="View" @click="goToRepo(row)"
        v-hasRole="['admin', 'teacher']">查看题库</el-button>
    </template>
  </course-components>
</template>

<script setup>
import CourseComponents from '@/views/manage/course/components/CourseComponents.vue';

const router = useRouter();

// 跳转到课程题库
function goToRepo(row) {
  const _courseId = row.id;
  router.push("/admin/exams/repos/" + _courseId);
}

</script>
