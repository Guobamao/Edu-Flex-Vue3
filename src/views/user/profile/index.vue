<template>
    <div class="app-container">
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>我的主页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ userInfo.nickName }}</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card class="info-card">
            <el-row :gutter="20">
                <el-col :span="4" class="text-center">
                    <userAvatar />
                </el-col>
                <el-col :span="16">
                    <p class="item">
                        <span class="label">用户名：</span>
                        <span class="value">{{ userInfo.nickName }}({{ userInfo.userName }})</span>
                        <span class="label">性别：</span>
                        <span class="value">
                            <template v-if="userInfo.sex === 0">
                                <svg-icon icon-class="male" />
                            </template>
                            <template v-else-if="userInfo.sex === 1">
                                <svg-icon icon-class="female" />
                            </template>
                            <template v-else>
                                保密
                            </template>
                        </span>
                    </p>
                    <p class="item">
                        <span class="label">手机号码：</span>
                        <span class="value">{{ userInfo.phonenumber ? userInfo.phonenumber : '未设置' }}</span>
                        <span class="label">邮箱：</span>
                        <span class="value">{{ userInfo.email ? userInfo.phonenumber : '未设置' }}</span>
                    </p>
                    <p class="item">
                        <span class="label">最后登录IP：</span>
                        <span class="value">{{ userInfo.loginIp }}</span>
                        <span class="label">最后登录时间：</span>
                        <span class="value">{{ userInfo.loginDate }}</span>
                    </p>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="updateInfo">修改个人信息</el-button>
                </el-col>
            </el-row>
        </el-card>
        <el-row justify="center">
            <el-col :span="24">
                <div class="tab-wrapper">
                    <el-tabs v-model="activeTab">
                        <el-tab-pane label="我的课程" name="course">
                            <MyCourse />
                        </el-tab-pane>
                        <el-tab-pane label="我的评价" name="evaluation">
                            <MyEvaluation />
                        </el-tab-pane>
                        <el-tab-pane label="我的评论" name="comment">
                            <MyComment />
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </el-col>
        </el-row>

        <el-dialog title="修改个人信息" v-model="open" width="600px" append-to-body>
            <el-tabs v-model="activeDialogTab">
                <el-tab-pane label="基本信息" name="basic">
                    <el-form ref="userRef" :model="userForm" :rules="rules" label-width="80px">
                        <el-form-item label="用户昵称" prop="nickName">
                            <el-input v-model="userForm.nickName" placeholder="请输入用户昵称" maxlength="30"
                                show-word-limit />
                        </el-form-item>
                        <el-form-item label="性别" prop="sex">
                            <el-radio-group v-model="userForm.sex">
                                <el-radio :value="0">男</el-radio>
                                <el-radio :value="1">女</el-radio>
                                <el-radio :value="2">保密</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="手机号码" prop="phonenumber">
                            <el-input v-model="userForm.phonenumber" placeholder="请输入手机号码" />
                        </el-form-item>
                        <el-form-item label="邮箱" prop="email">
                            <el-input v-model="userForm.email" placeholder="请输入邮箱" />
                        </el-form-item>
                    </el-form>
                </el-tab-pane>
                <el-tab-pane label="修改密码" name="password">
                    <el-form ref="pwdRef" :model="pwdForm" :rules="rules" label-width="80px">
                        <el-form-item label="旧密码" prop="oldPassword">
                            <el-input v-model="pwdForm.oldPassword" type="password" placeholder="请输入旧密码"
                                show-password />
                        </el-form-item>
                        <el-form-item label="新密码" prop="newPassword">
                            <el-input v-model="pwdForm.newPassword" type="password" placeholder="请输入新密码"
                                show-password />
                        </el-form-item>
                        <el-form-item label="确认密码" prop="confirmPassword">
                            <el-input v-model="pwdForm.confirmPassword" type="password" placeholder="请输入确认密码"
                                show-password />
                        </el-form-item>
                    </el-form>
                </el-tab-pane>
            </el-tabs>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="cancel">取消</el-button>
                    <el-button type="primary" @click="submitForm">
                        确认修改
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>
<script setup name="UserProfile">
import userAvatar from '@/views/system/user/profile/userAvatar.vue';
import { getUserProfile } from "@/api/user/student";
import { updateUserProfile, updateUserPwd } from "@/api/system/user";
import MyCourse from "./components/MyCourse.vue";
import MyEvaluation from "./components/MyEvaluation.vue";
import MyComment from "./components/MyComment.vue";
import { parseTime } from '@/utils/ruoyi'
import useUserStore from '@/store/modules/user'

const { proxy } = getCurrentInstance();
const userStore = useUserStore()
const userInfo = ref({})
const userForm = ref({})
const pwdForm = ref({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
})

const activeTab = ref('course');
const activeDialogTab = ref('basic');

const equalToPassword = (rule, value, callback) => {
    if (pwdForm.value.newPassword !== value) {
        callback(new Error("两次输入的密码不一致"));
    } else {
        callback();
    }
};

const rules = ref({
    nickName: [{ required: true, message: "用户昵称不能为空", trigger: "blur" }],
    sex: [{ required: true, message: "用户性别不能为空", trigger: "blur" }],
    email: [{ required: true, message: "邮箱地址不能为空", trigger: "blur" }, { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }],
    phonenumber: [{ required: true, message: "手机号码不能为空", trigger: "blur" }, { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }],
    oldPassword: [{ required: true, message: "旧密码不能为空", trigger: "blur" }],
    newPassword: [{ required: true, message: "新密码不能为空", trigger: "blur" }, { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" }, { pattern: /^[^<>"'|\\]+$/, message: "不能包含非法字符：< > \" ' \\\ |", trigger: "blur" }],
    confirmPassword: [{ required: true, message: "确认密码不能为空", trigger: "blur" }, { required: true, validator: equalToPassword, trigger: "blur" }]
});


const open = ref(false);
function getUser() {
    getUserProfile().then(res => {
        userInfo.value = res.data;
        userInfo.value.avatar = proxy.$previewUrl + userInfo.value.avatar;
        userInfo.value.loginDate = parseTime(userInfo.value.loginDate, '{y}-{m}-{d} {h}:{i}:{s}');
    });
};


function updateInfo() {
    userForm.value = {
        nickName: userInfo.value.nickName,
        sex: userInfo.value.sex,
        phonenumber: userInfo.value.phonenumber,
        email: userInfo.value.email
    }
    open.value = true;
}

function cancel() {
    proxy.resetForm("userRef")
    proxy.resetForm("pwdRef")
    open.value = false;
    activeDialogTab.value = 'basic'
}

function submitForm() {
    proxy.$refs["userRef"].validate(valid => {
        if (valid) {
            if (activeDialogTab.value === 'basic') {
                updateUserProfile(userForm.value).then(res => {
                    proxy.$modal.msgSuccess("资料修改成功");
                    getUser();
                    cancel();
                });
            }
        }
    })
    proxy.$refs["pwdRef"].validate(valid => {
        if (valid) {
            updateUserPwd(pwdForm.value.oldPassword, pwdForm.value.newPassword).then(res => {
                proxy.$modal.confirm("修改成功, 请重新登录").then(() => {
                    userStore.logOut().then(() => {
                        location.href = '/login';
                    })
                }).catch(() => {
                    userStore.logOut().then(() => {
                        location.href = '/login';
                    })
                })
            })
        }
    })
}

document.title = '我的主页 - 学智灵云课堂';

getUser();


</script>

<style lang="scss" scoped>
.info-card {
    margin-top: 20px;

    .item {
        font-size: 15px;

        .value {
            margin-right: 20px;
            color: #666;
        }
    }
}
</style>