<template>
  <course-components>
    <template #action="{ row }">
      <el-button link type="primary" icon="View" @click="goToComment(row)"
        v-hasRole="['admin', 'teacher']">查看评论</el-button>
    </template>
  </course-components>
</template>

<script setup>
import CourseComponents from '@/views/manage/course/components/CourseComponents.vue';

const router = useRouter();

// 跳转到课程作业
function goToComment(row) {
  const _courseId = row.id;
  router.push("/admin/comment/" + _courseId);
}

</script>
