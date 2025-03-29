<template>
  <div class="app-container">
    <TableView v-if="viewType === 'table'">
      <template #change>
        <el-button type="success" @click="viewType = 'graph'">图形视图</el-button>
      </template>
    </TableView>
    <GraphView v-if="viewType === 'graph'">
      <template #change>
        <el-button type="success" @click="viewType = 'table'">表格视图</el-button>
      </template>
    </GraphView>
  </div>
</template>

<script setup>
import TableView from './components/TableView.vue';
import GraphView from './components/GraphView.vue';

const viewType = ref('table');
</script>
