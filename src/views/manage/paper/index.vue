<template>
  <course-components>
    <template #extColumn>
      <el-table-column label="试卷数量" align="center" prop="paperNum" />
    </template>
    <template #action="{ row }">
      <el-button link type="primary" icon="View" @click="goToPaper(row)"
        v-hasRole="['admin', 'teacher']">查看试卷</el-button>
    </template>
  </course-components>
</template>

<script setup>
import CourseComponents from '@/views/manage/course/components/CourseComponents.vue';

const router = useRouter();

// 跳转到课程题库
function goToPaper(row) {
  const _courseId = row.id;
  router.push("/admin/exams/papers/" + _courseId);
}

</script>
