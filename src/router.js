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
      children: [
        // // Dashboard
        // {
        //   name: 'Dashboard',
        //   path: '',
        //   component: () => import('@/views/dashboard/Dashboard'),
        // },
        // // Pages
        // {
        //   name: 'User Profile',
        //   path: 'pages/user',
        //   component: () => import('@/views/dashboard/pages/UserProfile'),
        // },
        // {
        //   name: 'Notifications',
        //   path: 'components/notifications',
        //   component: () => import('@/views/dashboard/component/Notifications'),
        // },
        // {
        //   name: 'Icons',
        //   path: 'components/icons',
        //   component: () => import('@/views/dashboard/component/Icons'),
        // },
        // {
        //   name: 'Typography',
        //   path: 'components/typography',
        //   component: () => import('@/views/dashboard/component/Typography'),
        // },
        // // Tables
        // {
        //   name: 'Regular Tables',
        //   path: 'tables/regular-tables',
        //   component: () => import('@/views/dashboard/tables/RegularTables'),
        // },
        // // Maps
        // {
        //   name: 'Google Maps',
        //   path: 'maps/google-maps',
        //   component: () => import('@/views/dashboard/maps/GoogleMaps'),
        // },
        // Graphs
        {
          name: 'Graphs',
          path: '/graphs',
          component: () => import('@/views/dashboard/Graphs'),
        },
        // Database
        {
          name: 'Locations',
          path: 'database/locations',
          component: () => import('@/views/dashboard/data/Locations'),
        },
        {
          name: 'Products',
          path: 'database/products',
          component: () => import('@/views/dashboard/data/Products'),
        },
        {
          name: 'Providers',
          path: 'database/providers',
          component: () => import('@/views/dashboard/data/Providers'),
        },
        {
          name: 'Settings',
          path: '/settings',
          component: () => import('@/views/dashboard/pages/Settings'),
        },
        {
          name: 'Specialties',
          path: 'database/specialties',
          component: () => import('@/views/dashboard/data/Specialties'),
        },
        {
          name: 'Transfusions',
          path: 'database/transfusions',
          component: () => import('@/views/dashboard/tables/Database'),
        },
      ],
    },
  ],
})
