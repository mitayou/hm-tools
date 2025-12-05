import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Settings from '../views/Settings.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/more',
    name: 'MoreFeatures',
    component: () => import('../views/MoreFeatures.vue')
  },
  {
    path: '/experimental',
    name: 'Experimental',
    component: () => import('../views/Experimental.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
