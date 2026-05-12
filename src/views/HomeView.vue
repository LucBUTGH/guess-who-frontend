<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPlayerStats } from '../services/api'
import type { PlayerStats } from '../types'

const router = useRouter()
const username = localStorage.getItem('username') || ''
const stats = ref<PlayerStats | null>(null)

const winRate = computed(() => {
  if (!stats.value) return 0
  const total = stats.value.wins + stats.value.losses
  return total > 0 ? Math.round(stats.value.wins / total * 100) : 0
})

onMounted(async () => {
  try {
    stats.value = (await getPlayerStats()).data
  } catch {}
})

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-[#07080F]">

    <div aria-hidden="true" class="pointer-events-none fixed inset-0 overflow-hidden">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[50rem] h-[30rem] rounded-full bg-amber-500/[0.04] blur-3xl"></div>
    </div>

    <header class="border-b border-white/[0.06] bg-[#07080F]/80 backdrop-blur sticky top-0 z-10">
      <div class="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
        <router-link to="/" class="group flex items-baseline gap-2">
          <span class="text-base font-black text-zinc-100 tracking-tight group-hover:text-amber-400 transition-colors">Guess Who</span>
          <span class="text-amber-400 text-xs font-medium">Genshin</span>
        </router-link>
        <div class="flex items-center gap-4">
          <span class="text-sm text-zinc-400">{{ username }}</span>
          <button
            @click="logout"
            class="text-xs text-zinc-500 hover:text-zinc-200 transition-colors px-3 py-1.5 rounded-lg border border-white/[0.06] hover:border-white/[0.12]"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-6 py-14 space-y-12">

      <section>
        <p class="text-amber-400 text-xs uppercase tracking-[0.25em] font-medium mb-3">Bienvenue</p>
        <h2 class="text-5xl font-black text-zinc-100 tracking-tight mb-4">{{ username }}</h2>
        <p class="text-zinc-500 text-sm max-w-xs leading-relaxed">
          Devinez le personnage de votre adversaire avant qu'il ne devine le vôtre.
        </p>
      </section>

      <section v-if="stats" class="grid grid-cols-3 gap-3">
        <div class="bg-[#0D1120] border border-white/[0.06] rounded-2xl p-6">
          <p class="text-3xl font-black text-emerald-400 font-mono tabular-nums">{{ stats.wins }}</p>
          <p class="text-[10px] text-zinc-500 mt-1.5 uppercase tracking-widest">Victoires</p>
        </div>
        <div class="bg-[#0D1120] border border-white/[0.06] rounded-2xl p-6">
          <p class="text-3xl font-black text-rose-400 font-mono tabular-nums">{{ stats.losses }}</p>
          <p class="text-[10px] text-zinc-500 mt-1.5 uppercase tracking-widest">Défaites</p>
        </div>
        <div class="bg-[#0D1120] border border-white/[0.06] rounded-2xl p-6">
          <p class="text-3xl font-black text-amber-400 font-mono tabular-nums">{{ winRate }}<span class="text-lg">%</span></p>
          <p class="text-[10px] text-zinc-500 mt-1.5 uppercase tracking-widest">Win rate</p>
        </div>
      </section>

      <div class="w-full h-px bg-white/[0.04]"></div>

      <section class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <router-link
          to="/lobby"
          class="group bg-amber-500 hover:bg-amber-400 rounded-2xl p-5 sm:p-7 transition-all duration-200 hover:scale-[1.02] block"
        >
          <p class="text-base sm:text-lg font-black text-[#07080F]">Jouer</p>
          <p class="text-[#07080F]/60 text-xs mt-1 font-medium">Créer ou rejoindre</p>
        </router-link>
        <router-link
          to="/career"
          class="group bg-[#0D1120] border border-white/[0.06] hover:border-amber-400/30 rounded-2xl p-5 sm:p-7 transition-all duration-200 hover:scale-[1.02] block"
        >
          <p class="text-base sm:text-lg font-black text-zinc-100">Carrière</p>
          <p class="text-zinc-500 text-xs mt-1">Historique & stats</p>
        </router-link>
        <router-link
          to="/leaderboard"
          class="group bg-[#0D1120] border border-white/[0.06] hover:border-amber-400/30 rounded-2xl p-5 sm:p-7 transition-all duration-200 hover:scale-[1.02] block"
        >
          <p class="text-base sm:text-lg font-black text-zinc-100">Classement</p>
          <p class="text-zinc-500 text-xs mt-1">Top 10 joueurs</p>
        </router-link>
      </section>

    </main>
  </div>
</template>
