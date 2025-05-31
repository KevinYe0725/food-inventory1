import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/staff',
    name: 'Staff',
    component: () => import('../views/Staff.vue')
  },
  {
    path: '/category',
    name: 'Category',
    component: () => import('../views/Category.vue')
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('../views/Statistics.vue')
  },
  {
    path: '/markets',
    name: 'Markets',
    component: () => import('../views/Markets.vue')
  },
  {
    path: '/market/:marketId',
    name: 'MarketDetail',
    component: () => import('../views/MarketDetail.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
