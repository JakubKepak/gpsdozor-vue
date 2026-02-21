import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/components/layout/AppLayout.vue'),
      children: [
        { path: '', component: () => import('@/views/dashboard/DashboardPage.vue') },
        { path: 'fleet', component: () => import('@/views/fleet/FleetPage.vue') },
        { path: 'map', component: () => import('@/views/map/LiveMapPage.vue') },
        { path: 'health', component: () => import('@/views/health/HealthPage.vue') },
        {
          path: 'health/:vehicleCode',
          component: () => import('@/views/health/VehicleDetailPage.vue'),
        },
        {
          path: 'eco-driving',
          component: () => import('@/views/eco-driving/EcoDrivingPage.vue'),
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
