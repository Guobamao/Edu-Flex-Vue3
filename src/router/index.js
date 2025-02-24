import { createWebHistory, createRouter } from 'vue-router'
/* Layout */
import Layout from '@/layout'
import UserLayout from '@/views/user/UserLayout';

/**
 * Note: 路由配置项
 *
 * hidden: true                     // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * alwaysShow: true                 // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                  // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                  // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                  // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'               // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * query: '{"id": 1, "name": "ry"}' // 访问路由的默认传递参数
 * roles: ['admin', 'common']       // 访问路由的角色权限
 * permissions: ['a:a:a', 'b:b:b']  // 访问路由的菜单权限
 * meta : {
    noCache: true                   // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
    title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'                // 设置该路由的图标，对应路径src/assets/icons/svg
    breadcrumb: false               // 如果设置为false，则不会在breadcrumb面包屑中显示
    activeMenu: '/system/user'      // 当路由设置了该属性，则会高亮相对应的侧边栏。
  }
 */

// 公共路由
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index.vue')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login'),
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/register'),
    hidden: true
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import('@/views/error/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error/401'),
    hidden: true
  },
  {
    path: '',
    redirect: '/index',
    component: UserLayout,
    children: [
      {
        // 用户端 - 首页页面
        path: '/index',
        component: () => import('@/views/user/index/index'),
        name: 'UserIndex',
      },
      {
        // 用户端 - 课程列表页面
        path: '/course',
        component: () => import('@/views/user/course/index'),
        name: 'UserCourseIndex',
        hidden: true,
      },
      {
        // 用户端 - 课程详情页面
        path: '/course/:courseId',
        component: () => import('@/views/user/course/detail'),
        name: 'UserCourseDetail',
        hidden: true,
      },
      {
        // 用户端 - 课程学习页面
        path: '/course/study/:materialId',
        component: () => import('@/views/user/course/study'),
        name: 'UserCourseStudy',
        hidden: true,
      },
      {
        // 用户端 - 搜索页面
        path: '/search',
        component: () => import('@/views/user/search/index'),
        name: 'UserSearch',
        hidden: true,
      },
      {
        // 用户端 - 个人中心页面
        path: '/profile',
        component: () => import('@/views/user/profile/index'),
        name: 'UserProfile',
        hidden: true,
      },
      {
        // 用户端 - 作业列表页面
        path: '/homework',
        component: () => import('@/views/user/homework/index'),
        name: 'UserHomework',
        hidden: true,
      },
      {
        // 用户端 - 作业详情页面
        path: '/homework/:homeworkId',
        component: () => import('@/views/user/homework/detail'),
        name: 'UserHomeworkDetail',
        hidden: true,
      },
      {
        // 用户端 - 考试列表页面
        path: '/exam',
        component: () => import('@/views/user/exam/index'),
        name: 'UserExam',
        hidden: true
      },
      {
        // 用户端 - 考试准备页面
        path: '/exam/prepare/:examId',
        component: () => import('@/views/user/exam/prepare'),
        name: 'UserExamPrepare',
        hidden: true
      },
      {
        // 用户端 - 考试结果页面
        path: '/exam/result/:id',
        component: () => import('@/views/user/exam/result'),
        name: 'UserExamResult',
        hidden: true
      },
      {
        // 用户端 - 我的学习目标
        path: '/goal',
        component: () => import('@/views/user/goal/index'),
        name: 'UserGoalIndex',
        hidden: true
      }
    ]
  },
  {
    // 后台管理 - 个人中心页面
    path: '/user',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'profile',
        component: () => import('@/views/system/user/profile/index'),
        name: 'Profile',
        meta: { title: '个人中心', icon: 'user' }
      }
    ]
  },
  {
    // 用户端 - 考试页面
    path: '/exam/start/:id',
    component: () => import('@/views/user/exam/detail'),
    name: 'UserExamDetail',
    hidden: true,
  },
]

// 动态路由，基于用户权限动态去加载
export const dynamicRoutes = [
  {
    path: '/admin/system/user-auth',
    component: Layout,
    hidden: true,
    permissions: ['system:user:edit'],
    children: [
      {
        path: 'role/:userId(\\d+)',
        component: () => import('@/views/system/user/authRole'),
        name: 'AuthRole',
        meta: { title: '分配角色', activeMenu: '/admin/system/user' }
      }
    ]
  },
  {
    path: '/admin/system/role-auth',
    component: Layout,
    hidden: true,
    permissions: ['system:role:edit'],
    children: [
      {
        path: 'user/:roleId(\\d+)',
        component: () => import('@/views/system/role/authUser'),
        name: 'AuthUser',
        meta: { title: '分配用户', activeMenu: '/admin/system/role' }
      }
    ]
  },
  {
    path: '/admin/system/dict-data',
    component: Layout,
    hidden: true,
    permissions: ['system:dict:list'],
    children: [
      {
        path: 'index/:dictId(\\d+)',
        component: () => import('@/views/system/dict/data'),
        name: 'Data',
        meta: { title: '字典数据', activeMenu: '/admin/system/dict' }
      }
    ]
  },
  {
    path: '/admin/monitor/job-log',
    component: Layout,
    hidden: true,
    permissions: ['monitor:job:list'],
    children: [
      {
        path: 'index/:jobId(\\d+)',
        component: () => import('@/views/monitor/job/log'),
        name: 'JobLog',
        meta: { title: '调度日志', activeMenu: '/admin/monitor/job' }
      }
    ]
  },
  {
    path: '/admin/tool/gen-edit',
    component: Layout,
    hidden: true,
    permissions: ['tool:gen:edit'],
    children: [
      {
        path: 'index/:tableId(\\d+)',
        component: () => import('@/views/tool/gen/editTable'),
        name: 'GenEdit',
        meta: { title: '修改生成配置', activeMenu: '/admin/tool/gen' }
      }
    ]
  },
  {
    path: '/admin/course/course-chapters',
    component: Layout,
    hidden: true,
    permissions: ['manage:chapter:list'],
    children: [
      {
        path: ':courseId(\\d+)',
        component: () => import('@/views/manage/course/course_chapter'),
        name: 'CourseChapter',
        meta: { title: '课程章节管理', activeMenu: '/admin/course/course' }
      }
    ]
  },
  {
    path: '/admin/exam/paper-compose',
    component: Layout,
    hidden: true,
    permissions: ['manage:paper:list'],
    children: [
      {
        path: ':paperId(\\d+)',
        component: () => import('@/views/manage/paper/PaperCompose'),
        name: 'PaperCompose',
        meta: { title: '试卷试题管理', activeMenu: '/admin/exams/paper' }
      }
    ]
  },
  {
    path: '/admin/comments/user-comments',
    hidden: true,
    component: Layout,
    permissions: ['manage:comment:list'],
    children: [
      {
        path: ':userId(\\d+)',
        component: () => import('@/views/manage/comments/userComments'),
        name: 'UserComments',
        meta: { title: '用户评论管理', activeMenu: '/admin/comments' }
      }
    ]
  },
  {
    path: '/admin/comments/course-comments',
    hidden: true,
    component: Layout,
    permissions: ['manage:comment:list'],
    children: [
      {
        path: ':courseId(\\d+)',
        component: () => import('@/views/manage/comments/courseComments'),
        name: 'CourseComments',
        meta: { title: '课程评论管理', activeMenu: '/admin/comments' }
      }
    ]
  },
  {
    path: '/admin/study/goal/student',
    hidden: true,
    component: Layout,
    permissions: ['manage:goal:list', 'manage:student:list'],
    children: [
      {
        path: ':goalId(\\d+)',
        component: () => import('@/views/manage/goal/GoalStudent'),
        name: 'GoalStudent',
        meta: { title: '学习目标-学生关联管理', activeMenu: '/admin/study/goal' }
      }
    ]
  },
  {
    path: '/admin/exams/exam/users',
    hidden: true,
    component: Layout,
    permissions: ['manage:exam:list', 'manage:student:list'],
    children: [
      {
        path: ':examId(\\d+)',
        component: () => import('@/views/manage/exam/ExamUsers'),
        name: 'ExamUsers',
        meta: { title: '考试人员', activeMenu: '/admin/exams/exam' }
      }
    ]
  },
  {
    path: '/admin/exams/exam/record',
    hidden: true,
    component: Layout,
    permissions: ['manage:exam:list', 'manage:student:list'],
    children: [
      {
        path: ':id(\\d+)',
        component: () => import('@/views/manage/exam/ExamRecord'),
        name: 'ExamRecord',
        meta: { title: '考试记录详情', activeMenu: '/admin/exams/exam' }
      }
    ]
  },
  {
    path: '/admin/exams/exam/record/pending',
    hidden: true,
    component: Layout,
    permissions: ['manage:exam:list', 'manage:student:list'],
    children: [
      {
        path: ':id(\\d+)',
        component: () => import('@/views/manage/exam/ExamPending'),
        name: 'ExamRecordPending',
        meta: { title: '考试阅卷', activeMenu: '/admin/exams/exam' }
      }
    ]
  },
  
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
});

export default router;
