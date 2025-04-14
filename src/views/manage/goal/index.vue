<template>
    <student-components>
        <template #action="{ row }">
            <el-button link type="primary" icon="View" @click="goToGoal(row)"
                v-hasRole="['admin', 'teacher']">查看学习目标</el-button>
        </template>
    </student-components>
</template>
<script setup>
import StudentComponents from '@/views/manage/student/components/StudentComponents.vue';

const router = useRouter();

function goToGoal(row) {
    router.push("/admin/study/goal/" + row.userId);
}
</script>