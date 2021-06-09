import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: () => import('@/views/dashboard/Home'),
    },
    {
      name: 'Locations',
      path: '/database/locations',
      component: () => import('@/views/dashboard/data/Locations'),
    },
    {
      name: 'Products',
      path: '/database/products',
      component: () => import('@/views/dashboard/data/Products'),
    },
    {
      name: 'Providers',
      path: '/database/providers',
      component: () => import('@/views/dashboard/data/Providers'),
    },
    {
      name: 'Settings',
      path: '/settings',
      component: () => import('@/views/dashboard/pages/Settings'),
    },
    {
      name: 'Specialties',
      path: '/database/specialties',
      component: () => import('@/views/dashboard/data/Specialties'),
    },
    {
      name: 'Transfusions',
      path: '/database/transfusions',
      component: () => import('@/views/dashboard/tables/Database'),
    },
    {
      name: 'Graphs',
      path: '/graphs',
      component: () => import('@/views/dashboard/Graphs'),
    },
    {
      name: 'Transfusions',
      path: '/tables',
      component: () => import('@/views/dashboard/tables/TransfusionTable'),
    },
  ],
})
