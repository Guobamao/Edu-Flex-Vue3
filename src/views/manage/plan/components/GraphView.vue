<template>
  <el-container>
    <el-aside width="200px" class="calendar-aside">
      <el-checkbox
        v-model="showAllGoal"
        :true-value="1"
        :false-value="0"
        @change="handleShowAllGoal"
        style="margin-left: 8px">
        查看全部
      </el-checkbox>
      <hr />
      <el-checkbox-group v-model="checkBoxValue" class="checkbox-group">
        <el-checkbox
          v-for="item in goalColorMap"
          :key="item.goalId"
          :label="item.goalName"
          :title="item.goalName"
          :value="item.goalId"
          :checked="showAllGoal === 1">
          <div class="checkbox-item">
            <div
              class="goal-color"
              :style="{
                backgroundColor: checkBoxValue.includes(item.goalId) ? item.color : '',
              }"></div>
            <span class="goal-name">{{ item.goalName }}</span>
          </div>
        </el-checkbox>
      </el-checkbox-group>
    </el-aside>
    <el-main class="calendar-container">
      <el-switch
        v-model="showWorkWeek"
        active-text="显示周末"
        inactive-text="隐藏周末"
        :active-value="false"
        :inactive-value="true"
        @change="changeWorkWeek" />
      <el-button-group class="btn-group">
        <el-button type="primary" @click="changeView('month')">月视图</el-button>
        <el-button type="primary" @click="changeView('week')">周视图</el-button>
        <el-button type="primary" @click="changeView('day')">日视图</el-button>
        <slot name="change"></slot>
      </el-button-group>
      <div class="calendar-date">
        <el-button round @click="onSwitchToday()">今天</el-button>
        <el-button icon="ArrowLeft" circle @click="onSwitchPrev()" />
        <el-button icon="ArrowRight" circle @click="onSwitchNext()" />
        <div class="date-range">{{ dateRangeText }}</div>
      </div>
      <div id="calendar" style="height: 600px"></div>

      <!-- 遮罩 -->
      <div class="mask" v-show="showPopover" @click="handleClose"></div>
      <!-- 创建计划 popover -->
      <el-popover
        :virtual-ref="triggerRef"
        virtual-triggering
        :title="title"
        :width="600"
        :visible="showPopover"
        :popper-options="{
          boundariesElement: 'viewport',
          removeOnDestroy: true,
        }">
        <el-form ref="planRef" :model="form" :rules="rules" label-width="80px">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item label="学习目标" prop="goalId">
                <el-select v-model="form.goalId" placeholder="请选择学习目标">
                  <el-option
                    v-for="item in goalList"
                    :key="item.id"
                    :label="item.goalName"
                    :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="计划标题" prop="title">
                <el-input v-model="form.title" placeholder="请输入计划标题" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item label="开始时间" prop="startTime">
                <el-date-picker
                  v-model="form.startTime"
                  type="datetime"
                  placeholder="选择开始时间"
                  @change="handleStartTimeChange"
                  style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="结束时间" prop="endTime">
                <el-date-picker
                  v-model="form.endTime"
                  type="datetime"
                  placeholder="选择结束时间"
                  style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="计划内容" prop="content">
            <el-input v-model="form.content" type="textarea" placeholder="请输入计划内容" />
          </el-form-item>
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item label="是否提醒" prop="remind">
                <el-radio-group v-model="form.remind">
                  <el-radio value="0">不提醒</el-radio>
                  <el-radio value="1">提醒</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="提醒时间" prop="reminderTime" v-if="form.remind == '1'">
                <el-date-picker
                  clearable
                  v-model="form.reminderTime"
                  type="datetime"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  placeholder="请选择提醒时间">
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item>
            <el-button type="primary" plain size="small" @click="submitForm">保存</el-button>
          </el-form-item>
        </el-form>
      </el-popover>
      <!-- 查看计划 popover -->
      <div class="mask" v-show="showDetailPopover" @click="handleDetailClose"></div>
      <el-popover
        :virtual-ref="triggerRef"
        virtual-triggering
        placement="top"
        :width="280"
        :visible="showDetailPopover"
        :popper-style="{ 'border-top': `4px solid ${currentPlan.color}` }">
        <div class="plan-container">
          <div class="plan-header">
            <div class="plan-title">{{ currentPlan.title }}</div>
            <div class="plan-date">{{ currentPlan.startTime }} - {{ currentPlan.endTime }}</div>
          </div>
          <div class="plan-detail">
            <div class="goal-name">
              <svg-icon class-name="location-icon" icon-class="location" />
              <span>{{ currentPlan.goalName }}</span>
            </div>
            <div class="content">
              <svg-icon class-name="skill-icon" icon-class="skill" />
              <span>{{ currentPlan.content }}</span>
            </div>
            <div class="status">
              <svg-icon class-name="status-icon" icon-class="star" />
              <dict-tag :options="common_status" :value="currentPlan.status" />
            </div>
            <div class="remind" v-if="currentPlan.remind == '1'">
              <svg-icon class-name="time-icon" icon-class="time" />
              <span>{{ currentPlan.reminderTime }}</span>
            </div>
          </div>
          <div class="plan-footer">
            <div class="plan-btn">
              <el-button plain size="small" icon="Edit" @click="handleUpdate"> 修改 </el-button>
              <el-button type="danger" plain size="small" icon="Delete" @click="handleDelete">
                删除
              </el-button>
              <el-button
                v-if="currentPlan.status === 0"
                type="primary"
                size="small"
                icon="Check"
                @click="startPlan">
                开始
              </el-button>
              <el-button
                v-if="currentPlan.status === 1"
                type="primary"
                size="small"
                icon="Check"
                @click="endPlan">
                结束
              </el-button>
            </div>
          </div>
        </div>
      </el-popover>
    </el-main>
  </el-container>
</template>
<script setup>
import Calendar from "@toast-ui/calendar";
import "@toast-ui/calendar/dist/toastui-calendar.css";
import { listPlan, getPlan, delPlan, addPlan, updatePlan } from "@/api/manage/plan";
import { listGoal } from "@/api/manage/goal";
import { loadAllParams } from "@/api/page";
import { parseTime } from "@/utils/ruoyi";
import { debounce } from "lodash-es";

const { proxy } = getCurrentInstance();
const { common_status } = proxy.useDict("common_status");

const route = useRoute();
const calendar = ref();

const showWorkWeek = ref(false); // 是否显示周末 true-不显示 false-显示
const dateRangeText = ref(""); // 日期范围文本
const showPopover = ref(false); // 创建计划 Popover
const showDetailPopover = ref(false); // 计划详情 Popover
const title = ref("");
const triggerRef = ref(null); // 触发 popover 的元素

const goalList = ref([]); // 目标列表
const planList = ref([]); // 计划列表
const currentPlan = ref({}); // 当前计划

const showAllGoal = ref(1); // 查看全部
const checkBoxValue = ref([]); // 勾选目标

const backgroundColors = [
  "#ff8b88",
  "#ffd966",
  "#ffe680",
  "#fff0a3",
  "#d9e778",
  "#a4d8a7",
  "#77dd77",
  "#a1caf1",
  "#8da9c2",
  "#b2a9c2",
  "#d9a1c2",
  "#ffb2a9",
  "#ff8b88",
  "#ffd966",
  "#ffe680",
  "#fff0a3",
  "#d9e778",
  "#a4d8a7",
];
const goalColorMap = ref({});

const form = ref({
  goalId: "",
  title: "",
  startTime: "",
  endTime: "",
  content: "",
  remind: "0",
  reminderTime: null,
});

const rules = ref({
  goalId: [{ required: true, message: "请选择学习目标", trigger: "blur" }],
  title: [{ required: true, message: "请输入标题", trigger: "blur" }],
  startTime: [{ required: true, message: "请选择开始时间", trigger: "blur" }],
  endTime: [
    { required: true, message: "请选择结束时间", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (!value || !form.value.startTime) {
          return callback();
        }
        if (new Date(value) < new Date(form.value.startTime)) {
          callback(new Error("结束时间不能早于开始时间"));
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
  content: [{ required: true, message: "请输入学习内容", trigger: "blur" }],
  remind: [{ required: true, message: "是否提醒不能为空", trigger: "blur" }],
  reminderTime: [{ required: true, message: "提醒时间不能为空", trigger: "blur" }],
});

function init() {
  calendar.value = new Calendar("#calendar", {
    defaultView: "month",
    useFormPopup: false,
    useDetailPopup: false,
    usageStatistics: false,
    week: {
      startDayOfWeek: 1,
      dayNames: ["日", "一", "二", "三", "四", "五", "六"],
      workweek: showWorkWeek.value, // 是否显示周末
      showNowIndicator: true, // 当前时刻指示器
      eventView: ["time"],
      taskView: ["task"],
    },
    month: {
      startDayOfWeek: 1,
      dayNames: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
      workweek: showWorkWeek.value, // 是否显示周末
      showTimezoneCollapseButton: true,
      timezonesCollapsed: true,
      visibleWeeksCount: 0,
    },
    gridSelection: {
      enableDblClick: false,
      enableClick: true,
    },
    timezone: {
      zones: [
        {
          timezoneName: "Asia/Shanghai",
        },
      ],
    },
  });
  // 选中日期
  calendar.value.on("selectDateTime", (e) => {
    form.value.startTime = parseTime(e.start, "{y}-{m}-{d} {h}:{i}:{s}");
    form.value.endTime = parseTime(e.end, "{y}-{m}-{d} {h}:{i}:{s}");
    handleStartTimeChange(form.value.startTime);
    title.value = "创建学习计划";
    showPopover.value = true;
    if (calendar.value.getViewName() === "month") {
      triggerRef.value = e.nativeEvent.target;
    } else {
      setTimeout(() => {
        const ele = e.nativeEvent.target;
        triggerRef.value = ele.nextElementSibling;
      });
    }
  });
  // 选中事件
  calendar.value.on("clickEvent", (e) => {
    getPlan(e.event.id).then((res) => {
      currentPlan.value = res.data;
      currentPlan.value.remind = currentPlan.value.reminderTime ? "1" : "0";
      currentPlan.value.color = e.event.backgroundColor;
      currentPlan.value.calendarId = e.event.calendarId;
      showDetailPopover.value = true;
      triggerRef.value = e.nativeEvent.target;
    });
  });
  // 修改事件
  calendar.value.on("beforeUpdateEvent", ({ event, changes }) => {
    console.log("changes.start: ", !changes.start);
    console.log("changes.end: ", !changes.end);
    if (!changes.start && !changes.end) {
      return;
    }
    debouncedUpdateEvent(event, changes);
  });
  setDateRangeText();
}

// 防抖修改事件
const debouncedUpdateEvent = debounce((event, changes) => {
  const data = {
    id: event.id,
    goalId: event.location,
    startTime: parseTime(changes.start, "{y}-{m}-{d} {h}:{i}:{s}"),
    endTime: parseTime(changes.end, "{y}-{m}-{d} {h}:{i}:{s}"),
  };
  updatePlan(data).then(() => {
    calendar.value.updateEvent(event.id, event.calendarId, changes);
    proxy.$modal.msgSuccess("修改成功");
  });
}, 50);

// 切换是否显示周末
function changeWorkWeek() {
  calendar.value.setOptions({
    week: {
      workweek: showWorkWeek.value,
    },
    month: {
      workweek: showWorkWeek.value,
    },
  });
}

// 切换视图
function changeView(viewName) {
  calendar.value.changeView(viewName);
  setDateRangeText();
}

// 切换到今天
function onSwitchToday() {
  calendar.value.today();
  setDateRangeText();
}

// 切换到上一天
function onSwitchPrev() {
  calendar.value.prev();
  setDateRangeText();
}

// 切换到下一天
function onSwitchNext() {
  calendar.value.next();
  setDateRangeText();
}

// 弹出层关闭事件
function handleClose() {
  showPopover.value = false;
  proxy.resetForm("planRef");
  form.value = {
    // 重置表单
    goalId: "",
    title: "",
    startTime: "",
    endTime: "",
    content: "",
    remind: "0",
    reminderTime: null,
  };
  calendar.value.clearGridSelections(); // 清除选中
}

// 计划详情弹出层关闭事件
function handleDetailClose() {
  showDetailPopover.value = false;
}

// 删除计划
function handleDelete() {
  proxy.$modal
    .confirm("确认删除该学习计划？")
    .then(() => {
      delPlan(currentPlan.value.id).then((res) => {
        proxy.$message.success("删除成功");
        showDetailPopover.value = false;
        calendar.value.deleteEvent(currentPlan.value.id, currentPlan.value.calendarId);
      });
    })
    .catch(() => {});
}

// 添加计划
function submitForm() {
  proxy.$refs["planRef"].validate((valid) => {
    if (valid) {
      form.value.startTime = parseTime(form.value.startTime, "{y}-{m}-{d} {h}:{i}:{s}");
      form.value.endTime = parseTime(form.value.endTime, "{y}-{m}-{d} {h}:{i}:{s}");
      if (form.value.id) {
        updatePlan(form.value).then((res) => {
          calendar.value.updateEvent(form.value.id, "1", {
            title: form.value.title,
            category: "time",
            start: form.value.startTime,
            end: form.value.endTime,
            body: form.value.content,
            location: form.value.goalId,
            backgroundColor: goalColorMap.value[form.value.goalId].color,
          });
          proxy.$message.success("修改成功");
          handleClose();
        });
      } else {
        addPlan(form.value).then((res) => {
          const event = {
            id: form.value.id,
            calendarId: "1",
            title: form.value.title,
            category: "time",
            start: form.value.startTime,
            end: form.value.endTime,
            body: form.value.content,
            location: form.value.goalId,
            backgroundColor: goalColorMap.value[form.value.goalId].color,
          };
          calendar.value.createEvents([event]);
          proxy.$message.success("添加成功");
          handleClose();
        });
      }
    }
  });
}

// 修改计划
function handleUpdate() {
  form.value = currentPlan.value;
  form.value.remind = form.value.reminderTime ? "1" : "0";
  handleStartTimeChange(form.value.startTime);
  title.value = "修改学习计划";
  showDetailPopover.value = false;
  showPopover.value = true;
}

// 全选学习目标
function handleShowAllGoal() {
  if (showAllGoal.value === 1) {
    checkBoxValue.value = goalList.value.map((item) => item.id);
  } else {
    checkBoxValue.value = [];
  }
}

watch(
  () => checkBoxValue.value,
  (val) => {
    calendar.value.clear();
    const tempList = planList.value.filter((item) => {
      if (val.includes(item.goalId)) {
        return item;
      }
    });
    const events = tempList.map((item) => {
      return {
        id: item.id,
        calendarId: "1",
        title: item.title,
        category: "time",
        start: item.startTime,
        end: item.endTime,
        body: item.content,
        location: item.goalId,
        backgroundColor: item.color,
      };
    });
    calendar.value.createEvents(events);
  }
);

function setDateRangeText() {
  const date = calendar.value.getDate();
  const start = calendar.value.getDateRangeStart();
  const end = calendar.value.getDateRangeEnd();

  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  switch (calendar.value.getViewName()) {
    case "month":
      dateRangeText.value = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`;
      return;
    case "day":
      dateRangeText.value = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}.${String(date.getDate()).padStart(2, "0")}`;
      return;
    default:
      dateRangeText.value = `${startYear}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
        start.getDate()
      ).padStart(2, "0")} 
            ~ 
            ${startYear !== endYear ? `${endYear}.` : ""}${String(end.getMonth() + 1).padStart(
        2,
        "0"
      )}.${String(end.getDate()).padStart(2, "0")}`;
  }
}

function getPlanList() {
  listPlan().then((res) => {
    planList.value = res.rows;
    const goalIds = [...new Set(planList.value.map((item) => item.goalId))];
    goalIds.forEach((item, index) => {
      goalColorMap.value[item] = {
        goalId: item,
        color: backgroundColors[index],
        goalName: goalList.value.find((goal) => goal.id === item).goalName,
      };
    });
    planList.value.forEach((item) => {
      item.color = goalColorMap.value[item.goalId].color;
    });
    const events = planList.value.map((item) => {
      return {
        id: item.id,
        calendarId: "1",
        title: item.title,
        category: "time",
        start: item.startTime,
        end: item.endTime,
        body: item.content,
        location: item.goalId,
        backgroundColor: item.color,
      };
    });
    calendar.value.createEvents(events);
  });
}

function getGoalList() {
  const params = {
    ...loadAllParams,
    userId: route.params.userId,
  };
  listGoal(params).then((res) => {
    goalList.value = res.rows;
  });
}

function startPlan() {
  if (currentPlan.value.status === 0) {
    const data = currentPlan.value;
    data.status = 1;
    updatePlan(data).then((res) => {
      proxy.$message.success("开始学习计划");
    });
  }
}

function endPlan() {
  if (currentPlan.value.status === 1) {
    const data = currentPlan.value;
    data.status = 2;
    updatePlan(data).then((res) => {
      proxy.$message.success("结束学习计划");
    });
  }
}

function handleStartTimeChange(value) {
  // 提醒时间为提前10分钟
  const reminderTime = new Date(value) - 1000 * 60 * 10;
  form.value.reminderTime = parseTime(reminderTime, "{y}-{m}-{d} {h}:{i}:{s}");
}

onMounted(() => {
  init();
  getGoalList();
  getPlanList();
});
</script>
<style lang="scss" scoped>
.calendar-aside {
  .checkbox-group {
    :deep(.el-checkbox__input) {
      display: none;
    }
  }

  .checkbox-item {
    display: flex;

    .goal-color {
      border: 1px solid #999;
      width: 16px;
      height: 16px;
      border-radius: 18px;
      margin-right: 5px;
    }

    .goal-name {
      color: #444;
    }
  }
}

.calendar-container {
  padding-top: 8px;

  .btn-group {
    float: right;
  }

  .calendar-date {
    display: flex;
    align-items: center;

    button {
      font-weight: bold;
    }

    .date-range {
      font-size: 20px;
      margin-left: 10px;
    }
  }

  .mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 3;
  }
}

.plan-container {
  .plan-header {
    .plan-title {
      font-size: 15px;
      font-weight: bold;
      line-height: 1.6;
      word-break: break-all;
    }

    .plan-date {
      height: 24px;
      font-size: 12px;
      line-height: 2;
    }
  }

  .plan-detail {
    .goal-name {
      svg {
        margin-right: 8px;
      }

      span {
        font-size: 12px;
        line-height: 2;
      }
    }

    .content {
      svg {
        margin-right: 8px;
      }

      span {
        font-size: 14px;
        line-height: 2;
      }
    }

    .status {
      display: flex;
      align-items: center;

      svg {
        margin-right: 8px;
      }

      span {
        font-size: 12px;
        line-height: 2;
      }
    }

    .remind {
      svg {
        margin-right: 8px;
      }

      span {
        font-size: 12px;
        line-height: 2;
      }
    }
  }

  .plan-footer {
    margin-top: 10px;
  }
}

#calendar {
  margin-top: 10px;
}

:deep(.toastui-calendar-events) {
  margin-right: 0 !important;
}

:deep(.toastui-calendar-column .toastui-calendar-grid-selection) {
  left: 0;
  right: 0;
}

:deep(.toastui-calendar-template-time) {
  white-space: break-spaces;
}
</style>
