import { createRouter, createWebHistory } from 'vue-router'
import AuthPage from '../views/Authorization.vue' 
import TicketsPage from '../views/Tickets.vue'
import ProjectsPage from '../views/Projects.vue'
import ErrorPage from '../views/Error.vue'

const routes = [
  { path: '/', component: AuthPage },
  { path: '/tickets', component: TicketsPage },
  { path: '/projects', component: ProjectsPage , props: true },
  { 
    path: '/error/:code?', 
    component: ErrorPage,
    props: (route: { params: { code?: string } }) => ({ code: route.params.code })
  },
  { 
    path: '/:pathMatch(.*)*', 
    redirect: (_: unknown) => ({ path: '/error/404' })
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})


export default router