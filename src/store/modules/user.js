import router from "@/router";
import { ElMessageBox } from "element-plus";
import { login, logout, getInfo } from "@/api/login";
import { getToken, setToken, removeToken } from "@/utils/auth";
import { isHttp, isEmpty } from "@/utils/validate";
import defAva from "@/assets/images/avatar.png";
import { previewUrl } from "@/global";

const useUserStore = defineStore("user", {
  state: () => ({
    token: getToken(),
    id: "",
    name: "",
    nickName: "",
    avatar: "",
    roles: [],
    permissions: [],
  }),
  actions: {
    // 登录
    login(userInfo) {
      const username = userInfo.username.trim();
      const password = userInfo.password;
      const code = userInfo.code;
      const uuid = userInfo.uuid;
      return new Promise((resolve, reject) => {
        login(username, password, code, uuid)
          .then((res) => {
            setToken(res.token);
            this.token = res.token;
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    // 获取用户信息
    getInfo() {
      return new Promise((resolve, reject) => {
        getInfo()
          .then((res) => {
            const user = res.user;
            let avatar = user.avatar || "";
            if (!isHttp(avatar)) {
              avatar = isEmpty(avatar) ? defAva : previewUrl + avatar;
            }
            if (res.roles && res.roles.length > 0) {
              // 验证返回的roles是否是一个非空数组
              this.roles = res.roles;
              this.permissions = res.permissions;
            } else {
              this.roles = ["ROLE_DEFAULT"];
            }
            this.id = user.userId;
            this.name = user.userName;
            this.nickName = user.nickName;
            this.avatar = avatar;
            /* 初始密码提示 */
            if (res.isDefaultModifyPwd) {
              ElMessageBox.confirm(
                "您的密码还是初始密码，请修改密码！",
                "安全提示",
                {
                  confirmButtonText: "确定",
                  cancelButtonText: "取消",
                  type: "warning",
                }
              )
                .then(() => {
                  // 管理员、教师跳转后台密码修改页面
                  if (
                    this.roles.includes("admin") ||
                    this.roles.includes("teacher")
                  ) {
                    router.push({
                      name: "Profile",
                      params: { activeTab: "resetPwd" },
                    });
                  } else {
                    // 学生跳转用户个人中心页面
                    router.push({
                      name: "UserProfile",
                      params: { activeTab: "resetPwd" },
                    });
                  }
                })
                .catch(() => {});
            }
            /* 过期密码提示 */
            if (!res.isDefaultModifyPwd && res.isPasswordExpired) {
              ElMessageBox.confirm(
                "您的密码已过期，请尽快修改密码！",
                "安全提示",
                {
                  confirmButtonText: "确定",
                  cancelButtonText: "取消",
                  type: "warning",
                }
              )
                .then(() => {
                  // 管理员、教师跳转后台密码修改页面
                  if (
                    this.roles.includes("admin") ||
                    this.roles.includes("teacher")
                  ) {
                    router.push({
                      name: "Profile",
                      params: { activeTab: "resetPwd" },
                    });
                  } else {
                    // 学生跳转用户个人中心页面
                    router.push({
                      name: "UserProfile",
                    });
                  }
                })
                .catch(() => {});
            }
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    // 退出系统
    logOut() {
      return new Promise((resolve, reject) => {
        logout(this.token)
          .then(() => {
            this.token = "";
            this.roles = [];
            this.permissions = [];
            removeToken();
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
  },
});

export default useUserStore;
