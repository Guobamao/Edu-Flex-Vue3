import router from './router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { isHttp } from '@/utils/validate'
import { isRelogin } from '@/utils/request'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'
import Layout from '@/layout'

NProgress.configure({ showSpinner: false });

const whiteList = [
  '^/login$',
  '^/register$',
  '^/index$',
  '^/course(/.*)?$'
].map(path => new RegExp(path));

router.beforeEach((to, from, next) => {
  NProgress.start()
  if (getToken()) {
    to.meta.title && useSettingsStore().setTitle(to.meta.title)
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      if (useUserStore().roles.length === 0) {
        isRelogin.show = true
        // 判断当前用户是否已拉取完user_info信息
        useUserStore().getInfo().then(res => {
          // 根据用户角色动态生成首页路由
          const homeRoute = ref({});
          if (res.roles.indexOf('teacher') > -1 || res.roles.indexOf('admin') > -1) {
            homeRoute.value = {
              path: '',
              redirect: '/admin/index',
              component: Layout,
              children: [
                {
                  path: '/admin/index',
                  component: () => import('@/views/index'),
                  name: 'Index',
                  meta: { title: '首页' }
                }
              ]
            }
          }
          router.addRoute(homeRoute.value)
          isRelogin.show = false
          usePermissionStore().generateRoutes().then(accessRoutes => {
            // 根据roles权限生成可访问的路由表
            accessRoutes.forEach(route => {
              if (!isHttp(route.path)) {
                if (res.roles.indexOf('teacher') > -1 || res.roles.indexOf('admin') > -1) {
                  if (route.children[0].path == 'admin/index') {
                    route.children[0].meta.affix = true
                  }
                }
                router.addRoute(route) // 动态添加可访问路由表
              }
            })
            if ((res.roles.indexOf('teacher') > -1 || res.roles.indexOf('admin') > -1) && (from.path == '/login' || from.path == '/' ) ) {
              next({ path: '/admin/index', replace: true })
            } else {
              next({ ...to, replace: true }) // hack方法 确保addRoutes已完成
            }
          })
        }).catch(err => {
          useUserStore().logOut().then(() => {
            ElMessage.error(err)
            next({ path: '/' })
          })
        })
      } else {
        next()
      }
    }
  } else {
    // 没有token
    if (whiteList.some(regex => regex.test(to.path))) {
      // 在免登录白名单，直接进入
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`) // 否则全部重定向到登录页
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
