import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import FormBuilder from '../views/FormBuilder.vue'
import FormPreview from '../views/FormPreview.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/form-builder',
      name: 'form-builder',
      component: FormBuilder
    },
    {
      path: '/form-preview',
      name: 'form-preview',
      component: FormPreview
    }
  ]
})

export default router 