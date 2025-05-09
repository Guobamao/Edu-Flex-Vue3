<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleChapterAdd"
          v-hasRole="['admin', 'teacher']">新增</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table ref="tableRef" v-if="refreshTable" v-loading="loading" :data="chapterList" row-key="id" lazy
      :load="loadMaterials" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      @row-click="handleRowClick">
      <el-table-column label="章节名称" align="left" prop="chapterName">
        <template #default="scope">
          <!-- 判断为章节 -->
          <strong v-if="!scope.row.chapterId">
            第{{ scope.row.sort }}章
            {{ scope.row.chapterName }}
          </strong>
          <!-- 判断为资源 -->
          <span v-else>
            <svg-icon icon-class="document" v-if="scope.row.materialType === 1" />
            <svg-icon icon-class="picture" v-if="scope.row.materialType === 2" />
            <svg-icon icon-class="video" v-if="scope.row.materialType === 3" />
            <svg-icon icon-class="ppt" v-if="scope.row.materialType === 4" />
            <svg-icon icon-class="pdf" v-if="scope.row.materialType === 5" />
            <svg-icon icon-class="other" v-if="scope.row.materialType === 6" />
            {{ scope.row.name }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="left" width="400" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click.stop="handleChapterUpdate(scope.row)"
            v-hasRole="['admin', 'teacher']" v-if="!scope.row.chapterId">修改章节</el-button>
          <el-button link type="primary" icon="Edit" @click.stop="handleMaterialUpdate(scope.row)"
            v-hasRole="['admin', 'teacher']" v-else>修改资料</el-button>
          <el-button link type="primary" icon="View" @click.stop="viewMaterial(scope.row)"
            v-hasRole="['admin', 'teacher']" v-if="scope.row.chapterId">查看资料</el-button>
          <el-button link type="primary" icon="Plus" @click.stop="handleMaterialAdd(scope.row)"
            v-hasRole="['admin', 'teacher']" v-if="!scope.row.chapterId">新增资料</el-button>
          <el-button link type="primary" icon="Delete" @click.stop="handleChapterDelete(scope.row)"
            v-hasRole="['admin', 'teacher']" v-if="!scope.row.chapterId">删除</el-button>
          <el-button link type="primary" icon="Delete" @click.stop="handleMaterialDelete(scope.row)"
            v-hasRole="['admin', 'teacher']" v-else>删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改课程内容章节管理对话框 -->
    <el-dialog :title="title" v-model="chapterOpen" width="500px" append-to-body>
      <el-form ref="chapterRef" :model="chapterForm" :rules="rules" label-width="80px">
        <el-form-item label="章节名称" prop="name">
          <el-input v-model="chapterForm.name" placeholder="请输入章节名称" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="chapterForm.sort" :min="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitChapterForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加或修改课程资料对话框 -->
    <el-dialog :title="title" v-model="materialOpen" width="500px" append-to-body>
      <el-form ref="materialRef" :model="materialForm" :rules="rules" label-width="80px">
        <el-form-item label="关联章节" prop="chapterId">
          <el-select v-model="materialForm.chapterId" placeholder="请选择关联章节">
            <el-option v-for="chapter in chapterList" :key="chapter.id" :label="chapter.chapterName"
              :value="chapter.id">
              <template #default>
                第{{ chapter.sort }}章 {{ chapter.chapterName }}
              </template>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="资料名称" prop="name">
          <el-input v-model="materialForm.name" placeholder="请输入资料名称" />
        </el-form-item>
        <el-form-item label="上传文件" prop="fileId">
          <file-upload ref="fileUploadRef" v-model="materialForm.fileId" @fileList="getUploadFileList" />
        </el-form-item>
        <el-form-item label="文件类型" prop="materialType" v-if="materialForm.fileId">
          <el-select v-model="materialForm.materialType" placeholder="请选择文件类型">
            <el-option v-for="dict in material_type" :key="dict.value" :label="dict.label"
              :value="parseInt(dict.value)"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitMaterialForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <div>
      <el-image-viewer hide-on-click-modal @close="() => { showViewer = false }" v-if="showViewer" show-progress
        :url-list="previewList" />
    </div>


    <el-dialog title="视频预览" v-model="videoOpen" width="800px" append-to-body @close="onClosePlayer">
      <div ref="dplayerRef"></div>
    </el-dialog>
  </div>
</template>

<script setup name="CourseChapter">
import { listChapter, getChapter, delChapter, addChapter, updateChapter } from "@/api/manage/chapter";
import { listMaterial, getMaterial, delMaterial, addMaterial, updateMaterial } from "@/api/manage/material";
import { previewFile } from "@/api/manage/file";
import DPlayer from 'dplayer';
import { nextTick } from "vue";

const { proxy } = getCurrentInstance();
const route = useRoute();

const { material_type } = proxy.useDict("material_type");

const chapterList = ref([]);
const chapterOpen = ref(false);
const materialOpen = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const title = ref("");
const refreshTable = ref(true);
const videoOpen = ref(false);
const dplayerRef = ref(null)
const tableRef = ref(null);
const fileUploadRef = ref(null);
const dp = ref(null);

const data = reactive({
  chapterForm: {},
  materialForm: {},
  queryParams: {
    courseId: route.params.courseId
  },
  rules: {
    name: [
      { required: true, message: "章节名称不能为空", trigger: "blur" }
    ],
    chapterId: [
      { required: true, message: "关联章节不能为空", trigger: "blur" }
    ],
    name: [
      { required: true, message: "资料名称不能为空", trigger: "blur" }
    ],
    fileId: [
      { required: true, message: "文件不能为空", trigger: "blur" }
    ],
    materialType: [
      { required: true, message: "文件类型不能为空", trigger: "blur" }
    ]
  }
});

const showViewer = ref(false);
const previewList = ref([])

const { queryParams, chapterForm, materialForm, rules } = toRefs(data);

/** 查询课程内容章节管理列表 */
function getList() {
  loading.value = true;
  listChapter(queryParams.value).then(response => {
    chapterList.value = response.data
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  chapterOpen.value = false;
  materialOpen.value = false;
  reset();
}

// 表单重置
function reset() {
  chapterForm.value = {
    id: null,
    courseId: route.params && route.params.courseId,
    name: null,
    sort: chapterList.value.length + 1,
  };
  materialForm.value = {
    id: null,
    chapterId: null,
    name: null,
    fileId: null,
    duration: null
  }
  proxy.resetForm("materialRef");
  proxy.resetForm("chapterRef");
  setTimeout(() => {
    fileUploadRef.value.fileList = [];
  })
}


/** 新增按钮操作 */
function handleChapterAdd(row) {
  reset();
  chapterOpen.value = true;
  title.value = "添加课程内容章节管理";
}


function handleMaterialAdd(row) {
  reset();
  if (row != null && row.id) {
    materialForm.value.chapterId = row.id;
  }
  materialOpen.value = true;
  title.value = "添加课程资料";
}

/** 修改按钮操作 */
async function handleChapterUpdate(row) {
  reset();
  getChapter(row.id).then(res => {
    chapterForm.value = res.data;
    chapterOpen.value = true;
    title.value = "修改课程内容章节管理";
  });
}

function handleMaterialUpdate(row) {
  reset();
  const _id = row.id.split("-")[0];
  getMaterial(_id).then(response => {
    materialForm.value = response.data;
    materialOpen.value = true;
    title.value = "修改课程资料";
  });
}

/** 提交按钮 */
function submitChapterForm() {
  proxy.$refs["chapterRef"].validate(valid => {
    if (valid) {
      if (chapterForm.value.id != null) {
        updateChapter(chapterForm.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          chapterOpen.value = false;
          getList();
        });
      } else {
        addChapter(chapterForm.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          chapterOpen.value = false;
          getList();
        });
      }
    }
  });
}

function submitMaterialForm() {
  proxy.$refs["materialRef"].validate(valid => {
    if (valid) {
      if (materialForm.value.id != null) {
        updateMaterial(materialForm.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          materialOpen.value = false;
          getList();
          // 重新获取资料数据
          listMaterial({ chapterId: materialForm.value.chapterId }).then(response => {
            response.rows.map(item => {
              item.id = item.id + '-' + materialForm.value.chapterId
            })
            // 过滤出ChapterList中id = chapterId的数据并设置其children
            chapterList.value.map(item => {
              if (item.id == materialForm.value.chapterId) {
                item.children = response.rows
              }
            })
          })
        });
      } else {
        addMaterial(materialForm.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          materialOpen.value = false;
          refreshTableData(materialForm.value.chapterId);
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleChapterDelete(row) {
  proxy.$modal.confirm('是否确认删除课程内容章节管理编号为"' + row.id + '"的数据项？').then(function () {
    return delChapter(row.id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 删除资料操作 */
function handleMaterialDelete(row) {
  const _id = row.id.split("-")[0];
  proxy.$modal.confirm('是否确认删除课程资料编号为"' + _id + '"的数据项？').then(function () {
    return delMaterial(_id);
  }).then(() => {
    refreshTableData(row.chapterId);
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

// 存储懒加载的数据
const maps = new Map();
function loadMaterials(row, treeNode, resolve) {
  const _chapterId = row.id;

  // 懒加载时，将数据存储到maps中
  maps.set(_chapterId, { row, treeNode, resolve });

  listMaterial({ chapterId: _chapterId }).then(response => {
    if (response.rows.length > 0) {
      resolve(response.rows)
    } else {
      tableRef.value.store.states.lazyTreeNodeMap.value[_chapterId] = []
    }
  })
}

// 刷新表格
function refreshTableData(chapterId) {
  getList();
  const map = maps.get(chapterId);
  if (map) {
    const { row, treeNode, resolve } = map;
    loadMaterials(row, treeNode, resolve);
  }
}
// 获取子组件传出的上传文件列表
function getUploadFileList(fileList) {
  const file = fileList[0];
  materialForm.value.name = file.name;
  materialForm.value.materialType = file.type
  materialForm.value.duration = file.duration;
}

// 查看资料
function viewMaterial(row) {
  if (row.materialType === 1 || row.materialType === 4 || row.materialType === 5) {
    // 文本文件 / PPT / PDF，以图片方式预览
    previewFile(row.fileId).then(res => {
      const ids = res.data.map(item => item.id)
      previewList.value = ids.map(id => proxy.$previewFileUrl + id)
      showViewer.value = true
    })
  } else if (row.materialType === 2) {
    // 图片类型
    previewList.value = [proxy.$previewUrl + row.fileId]
    showViewer.value = true
  } else if (row.materialType === 3) {
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
          url: proxy.$previewVideo + row.fileId,
        }
      })
    })
  }
}

function onClosePlayer() {
  dp.value.destroy()
}

// 树形列表点击事件 
function handleRowClick(row, column, event) {
  row.expanded = !row.expanded;
  if (row.hasChildren) {
    const expandBtn = event.currentTarget.querySelector('.el-table__expand-icon')
    if (expandBtn) {
      expandBtn.click()
    }
  } else {
    tableRef.value.toggleRowExpansion(row, row.expanded)
  }
}
getList();
</script>
<style lang="scss" scoped>
.material-icon {
  .svg-icon {
    width: 1.5em;
    height: 1.5em;
    margin-right: 5px;
  }
}
</style>