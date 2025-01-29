// Composables
import { createRouter, createWebHistory } from 'vue-router'

import Intro from '@/views/Intro.vue'

const routes = [
  { path: '/', name: 'Home', component: () => import('@/views/Home.vue'), meta:{ transition: 'fade'} },
  { path: '/intro', name: 'Intro', component: () => import('@/views/Intro.vue') },
  { path: '/graph', name: 'Graph', component: () => import('@/views/Graph.vue') }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
