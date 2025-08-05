import request from "@/utils/request";

// 上传接口
export function uploadFile(data) {
  return request({
    url: "/common/upload",
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: data,
  });
}

// 上传头像接口
export function uploadAvatar(data) {
  return request({
    url: "/common/upload/avatar",
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: data,
  });
}

// 上传课程封面接口
export function uploadCover(data) {
  return request({
    url: "/common/upload/cover",
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: data,
  });
}

// 上传课程资料接口
export function uploadMaterial(data) {
  return request({
    url: "/common/upload/material",
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: data,
  });
}
