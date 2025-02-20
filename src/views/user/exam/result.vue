<template>
    <div class="app-container">
        <h2 class="text-center">{{ paperData.examName }}</h2>
        <p class="text-center" style="color: #666;">{{ paperData.startTime }}</p>

        <el-row style="margin-top: 20px;">
            <el-col :span="6" class="text-center">
                考生学号：{{ paperData.userName }}
            </el-col>
            <el-col :span="6" class="text-center">
                考生姓名：{{ paperData.nickName }}
            </el-col>
            <el-col :span="6" class="text-center">
                考试用时：{{ paperData.duration }}
            </el-col>
            <el-col :span="6" class="text-center">
                考试得分：{{ paperData.score }}
            </el-col>
        </el-row>
        <el-card style="margin-top: 20px">
            <div v-for="(item, index) in questionMap" :key="index">
                <div v-for="(question, questionIndex) in item" :key="questionIndex" class="question-item">
                    <el-row :gutter="10" class="mt10">
                        <el-col :span="20">
                            <span>
                                {{ question.orderNum }}. {{ question.title }}
                                （得分：{{ question.score }}）
                            </span>
                        </el-col>
                    </el-row>
                    <!-- 单选题 -->
                    <template v-if="question.type === 1">
                        <el-radio-group v-model="question.answer" class="options-group">
                            <el-radio v-for="(option, optionIndex) in question.options" :key="optionIndex"
                                :value="option.key" class="options" @click.prevent>
                                {{ option.key }}. {{ option.value }}
                            </el-radio>
                        </el-radio-group>
                    </template>
                    <!-- 多选题 -->
                    <template v-else-if="question.type === 2">
                        <el-checkbox-group v-model="question.answer" class="options-group">
                            <el-checkbox v-for="(option, optionIndex) in question.options" :key="optionIndex"
                                :value="option.key" class="options" @click.prevent>
                                {{ option.key }}. {{ option.value }}
                            </el-checkbox>
                        </el-checkbox-group>
                    </template>
                    <!-- 判断题 -->
                    <template v-else-if="question.type === 3">
                        <el-radio-group v-model="question.answer">
                            <el-radio :value="true"  class="options" @click.prevent>正确</el-radio>
                            <el-radio :value="false" class="options" @click.prevent>错误</el-radio>
                        </el-radio-group>
                    </template>
                    <!-- 填空题与简答题 -->
                    <template v-else>
                        <el-row :gutter="10" class="mt10 mb10">
                            <el-col :span="1.5">
                                <span>答案：</span>
                            </el-col>
                            <el-col :span="12">
                                <el-input v-model="question.answer" placeholder="请输入答案" class="options" readonly></el-input>
                            </el-col>
                        </el-row>
                    </template>
                </div>
            </div>
        </el-card>
    </div>
</template>
<script setup name="UserExamResult">

const { proxy } = getCurrentInstance()
const route = useRoute()

</script>
<style lang="scss" scoped></style>