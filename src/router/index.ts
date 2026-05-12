import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import CareerView from '../views/CareerView.vue'
import LobbyView from '../views/LobbyView.vue'
import GameView from '../views/GameView.vue'
import LeaderboardView from '../views/LeaderboardView.vue'
import NotFoundView from '../views/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView, meta: { requiresAuth: true, title: 'Guess Who – Accueil' } },
    { path: '/login', component: LoginView, meta: { title: 'Guess Who – Connexion' } },
    { path: '/career', component: CareerView, meta: { requiresAuth: true, title: 'Guess Who – Carrière' } },
    { path: '/lobby', component: LobbyView, meta: { requiresAuth: true, title: 'Guess Who – Salon' } },
    { path: '/game/:code', component: GameView, meta: { requiresAuth: true, title: 'Guess Who – Partie' } },
    { path: '/leaderboard', component: LeaderboardView, meta: { title: 'Guess Who – Classement' } },
    { path: '/:pathMatch(.*)*', component: NotFoundView, meta: { title: 'Guess Who – Page introuvable' } },
  ],
})

router.beforeEach((to) => {
  document.title = (to.meta.title as string) ?? 'Guess Who'
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) return '/login'
  if (to.path === '/login' && token) return '/'
})

export default router
