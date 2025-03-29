<template>
    <student-components>
        <template #action="{ row }">
            <el-button link type="primary" icon="View" @click="goToPlan(row)"
                v-hasRole="['admin', 'teacher']">查看学习计划</el-button>
        </template>
    </student-components>
</template>
<script setup>
import StudentComponents from '@/views/manage/student/components/StudentComponents.vue';

const router = useRouter();

function goToPlan(row) {
    router.push("/admin/study/plan/" + row.userId);
}
</script>