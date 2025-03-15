<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="文件名" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入文件名" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="文件类型" prop="fileType">
        <el-select v-model="queryParams.fileType" placeholder="请选择文件类型" style="width: 150px;" clearable
          @change="handleQuery">
          <el-option v-for="dict in material_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasRole="['admin']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasRole="['admin']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasRole="['admin']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="fileList" border @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" width="50" type="index" align="center" prop="id" />
      <el-table-column label="文件名" align="center" prop="originName" show-overflow-tooltip>
        <template #default="scope">
          <el-link type="primary" @click="handlePreview(scope.row)">{{ scope.row.originName }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="库文件名" align="center" prop="name" show-overflow-tooltip />
      <el-table-column label="文件类型" align="center" width="80" prop="fileType">
        <template #default="scope">
          <dict-tag :options="material_type" :value="scope.row.fileType" />
        </template>
      </el-table-column>
      <el-table-column label="文件大小" align="center" width="100" prop="size">
        <template #default="scope">
          {{ getFileSize(scope.row.size) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handlePreview(scope.row)">预览</el-button>
          <el-button link type="primary" icon="Download" @click="downloadFile(scope.row)">下载</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasRole="['manage:file:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasRole="['manage:file:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改资源管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="fileRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="文件名" prop="originName">
          <el-input v-model="form.originName" disabled />
        </el-form-item>
        <el-form-item label="库文件名" prop="name">
          <el-input v-model="form.name" disabled />
        </el-form-item>
        <el-form-item label="文件路径" prop="path">
          <el-input v-model="form.path" disabled />
        </el-form-item>
        <el-form-item label="文件大小" prop="size">
          <el-input v-model="form.size" disabled />
        </el-form-item>
        <el-form-item label="文件类型" prop="fileType">
          <el-select v-model="form.fileType" placeholder="请选择文件类型">
            <el-option v-for="dict in material_type" :key="dict.value" :label="dict.label"
              :value="parseInt(dict.value)" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <div>
      <el-image-viewer hide-on-click-modal @close="() => { showViewer = false }" v-if="showViewer"
        :url-list="previewList" />
    </div>


    <el-dialog title="视频预览" v-model="videoOpen" width="800px" append-to-body @close="onClosePlayer">
      <div ref="dplayerRef"></div>
    </el-dialog>
  </div>
</template>

<script setup name="File">
import { listFile, getFile, delFile, updateFile, previewFile } from "@/api/manage/file";
import { getFileSize } from "@/utils/index";
import DPlayer from 'dplayer';

const { proxy } = getCurrentInstance();
const { material_type } = proxy.useDict('material_type');

const fileList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const videoOpen = ref(false);
const dplayerRef = ref(null)
const dp = ref(null);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    originName: null,
    fileType: null
  },
  rules: {
    originName: [{ required: true, message: "文件名不能为空", trigger: "blur" }],
    name: [{ required: true, message: "库文件名不能为空", trigger: "blur" }],
    path: [{ required: true, message: "文件路径不能为空", trigger: "blur" }],
    size: [{ required: true, message: "文件大小不能为空", trigger: "blur" }],
    fileType: [{ required: true, message: "文件类型不能为空", trigger: "blur" }]
  }
});

const showViewer = ref(false);
const previewList = ref([])

const { queryParams, form, rules } = toRefs(data);

/** 查询资源管理列表 */
function getList() {
  loading.value = true;
  listFile(queryParams.value).then(response => {
    fileList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    originName: null,
    name: null,
    path: null,
    size: null,
    fileType: null,
  };
  proxy.resetForm("fileRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getFile(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改资源管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["fileRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateFile(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除资源管理编号为"' + _ids + '"的数据项？').then(function () {
    return delFile(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manage/file/export', {
    ...queryParams.value
  }, `file_${new Date().getTime()}.xlsx`)
}

// 预览资料
function handlePreview(row) {
  if (row.fileType === 1 || row.fileType === 4 || row.fileType === 5) {
    // 文本类型（Word、Json、Excel、HTML、CSS）
    previewFile(row.id).then(res => {
      const ids = res.data.map(item => item.id)
      previewList.value = ids.map(id => proxy.$previewFileUrl + id)
      showViewer.value = true
    })
  } else if (row.fileType === 2) {
    // 图片类型
    previewList.value = [proxy.$previewUrl + row.id]
    showViewer.value = true
  } else if (row.fileType === 3) {
    // 视频类型
    // 音视频类型
    videoOpen.value = true
    nextTick(() => {
      dp.value = new DPlayer({
        container: dplayerRef.value,
        autoplay: false,
        live: false,
        loop: false,
        theme: "#b7daff",
        lang: 'zh-cn',
        screenshot: false,
        hotkey: true,
        video: {
          type: 'auto',
          url: proxy.$previewVideo + row.id,
        }
      })
    })
  }
}

// 下载
function downloadFile(row) {
  proxy.download('/common/download/' + row.id, {}, row.originName)
}

function onClosePlayer() {
  dp.value.destroy()
}
getList();
</script>
