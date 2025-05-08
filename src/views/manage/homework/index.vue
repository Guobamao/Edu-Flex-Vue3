<template>
  <course-components>
    <template #extColumn>
      <el-table-column label="作业数" align="center" prop="homeworkNum" />
    </template>
    <template #action="{ row }">
      <el-button link type="primary" icon="View" @click="goToHomework(row)"
        v-hasRole="['admin', 'teacher']">查看作业</el-button>
    </template>
  </course-components>
</template>

<script setup>
import CourseComponents from '@/views/manage/course/components/CourseComponents.vue';

const router = useRouter();

// 跳转到课程作业
function goToHomework(row) {
  const _courseId = row.id;
  router.push("/admin/course/homeworks/" + _courseId);
}

</script>