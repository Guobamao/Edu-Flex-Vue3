<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="启用状态" prop="enabled">
        <el-select v-model="queryParams.enabled" placeholder="请选择启用状态" clearable @change="handleQuery"
          style="width: 150px;">
          <el-option label="禁用" :value="0" />
          <el-option label="启用" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasRole="['admin']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasRole="['admin']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasRole="['admin']">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="carouselList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="50" align="center" prop="id" />
      <el-table-column label="图片集合" align="center" prop="imgIds">
        <template #default="scope">
          <div class="img-list">
            <img v-for="(item, index) in scope.row.imgIds" :key="index" :src="item"
              @click="handlePreview(scope.row.imgIds, index)" style="height: 50px;" />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="启用状态" align="center" prop="enabled">
        <template #default="scope">
          <el-switch v-model="scope.row.enabled" :loading="loading1" :active-value="1" :inactive-value="0"
            active-text="启用" inactive-text="禁用" :before-change="() => handleBeforeChange(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasRole="['admin']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasRole="['admin']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改轮播图对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="carouselRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="轮播图图片" prop="imgIds">
          <image-upload v-model="form.imgIds" :action="proxy.$uploadUrl" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 图片预览 -->
    <div>
      <el-image-viewer hide-on-click-modal @close="() => { showViewer = false }" v-if="showViewer" show-progress
        :url-list="previewList" :initial-index="imageIndex" />
    </div>
  </div>
</template>

<script setup name="Carousel">
import { listCarousel, getCarousel, delCarousel, addCarousel, updateCarousel, enableCarousel } from "@/api/manage/carousel";

const { proxy } = getCurrentInstance();

const carouselList = ref([]);
const open = ref(false);
const loading = ref(true);
const loading1 = ref(false);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const showViewer = ref(false);
const previewList = ref([]);
const imageIndex = ref(0);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    enabled: null,
  },
  rules: {
    imgIds: [
      { required: true, message: "图片ID集合不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询轮播图列表 */
function getList() {
  loading.value = true;
  listCarousel(queryParams.value).then(response => {
    carouselList.value = response.rows;
    carouselList.value.forEach(item => {
      item.imgIds = item.imgIds.split(",").map(item => {
        return proxy.$previewUrl + item
      })
    })
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
    imgIds: null,
  };
  proxy.resetForm("carouselRef");
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

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加轮播图";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getCarousel(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改轮播图";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["carouselRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCarousel(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCarousel(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
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
  proxy.$modal.confirm('是否确认删除轮播图编号为"' + _ids + '"的数据项？').then(function () {
    return delCarousel(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

function handleBeforeChange(row) {
  loading1.value = true;
  if (row.enabled === 1) {
    loading1.value = false;
    proxy.$message.warning('请通过启用其他轮播图来禁用当前轮播图！');
    return false;
  } else {
    enableCarousel(row.id).then(response => {
      proxy.$modal.msgSuccess("启用成功");
      loading1.value = false;
      getList();
    });
    return true;
  }
}

// 预览图片
function handlePreview(urlList, index) {
  imageIndex.value = index;
  previewList.value = urlList;
  showViewer.value = true;
}

getList();
</script>
<style lang="scss" scoped>
.img-list {
  display: flex;

  img {
    margin-left: 5px;
    margin-right: 5px;
  }
}
</style>