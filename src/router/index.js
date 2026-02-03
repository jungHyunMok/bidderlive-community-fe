import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guest: true }
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('../views/UserView.vue'),
    meta: { requiresAuth: true, role: 'user' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const auth = sessionStorage.getItem('bidderlive-auth')
  let user = null
  try {
    user = auth ? JSON.parse(auth) : null
  } catch (_) {}

  if (to.meta.requiresAuth && !user) {
    next({ path: '/' })
    return
  }
  const routeRole = user?.entryType || user?.routeRole
  if (to.meta.role && user && routeRole !== to.meta.role) {
    next({ path: routeRole === 'admin' ? '/admin' : '/user' })
    return
  }
  next()
})

export default router
