<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getPlayerStats, getMyGames } from '../services/api'
import type { PlayerStats, GameHistory } from '../types'

const username = localStorage.getItem('username') || ''
const stats = ref<PlayerStats | null>(null)
const games = ref<GameHistory[]>([])
const loading = ref(true)

const winRate = computed(() => {
  if (!stats.value) return 0
  const total = stats.value.wins + stats.value.losses
  return total > 0 ? Math.round(stats.value.wins / total * 100) : 0
})

onMounted(async () => {
  try {
    const [statsRes, gamesRes] = await Promise.all([getPlayerStats(), getMyGames()])
    stats.value = statsRes.data
    games.value = gamesRes.data
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#07080F]">

    <header class="border-b border-white/[0.06] bg-[#07080F]/80 backdrop-blur sticky top-0 z-10">
      <div class="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
        <router-link to="/" class="text-zinc-500 hover:text-zinc-200 text-sm transition-colors">&larr; Accueil</router-link>
        <div class="w-px h-4 bg-white/[0.08]"></div>
        <div>
          <span class="text-sm font-bold text-zinc-100">Carrière</span>
          <span class="text-zinc-500 text-xs ml-2">{{ username }}</span>
        </div>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-6 py-12 space-y-10">

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

      <section>
        <h2 class="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Historique des parties</h2>

        <div v-if="loading" class="text-center py-16 text-zinc-600 text-sm">Chargement...</div>

        <div v-else-if="games.length === 0" class="bg-[#0D1120] border border-white/[0.06] rounded-2xl p-12 text-center">
          <p class="text-zinc-600 text-sm">Aucune partie jouée pour le moment.</p>
          <router-link to="/lobby" class="text-amber-400 hover:text-amber-300 text-xs mt-4 inline-block transition-colors font-medium">
            Jouer une première partie &rarr;
          </router-link>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="(game, i) in games"
            :key="i"
            class="bg-[#0D1120] border border-white/[0.06] rounded-xl px-5 py-4 flex items-center gap-4"
          >
            <span
              class="shrink-0 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wide"
              :class="game.result === 'WIN' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-rose-400/10 text-rose-400'"
            >
              {{ game.result === 'WIN' ? 'Victoire' : 'Défaite' }}
            </span>

            <span class="text-zinc-400 text-sm">
              vs <span class="font-bold text-zinc-200">{{ game.opponent }}</span>
            </span>

            <div class="flex-1"></div>

            <div class="flex items-center gap-3 shrink-0">
              <div class="flex items-center gap-2">
                <span class="text-[11px] text-zinc-500 hidden sm:block">{{ game.myCharacter?.name }}</span>
                <img
                  v-if="game.myCharacter?.imageUrl"
                  :src="game.myCharacter.imageUrl"
                  :alt="game.myCharacter.name"
                  class="w-9 h-9 rounded-lg object-cover ring-1 ring-amber-400/30"
                />
              </div>
              <span class="text-[10px] text-zinc-700 font-bold">VS</span>
              <div class="flex items-center gap-2">
                <img
                  v-if="game.opponentCharacter?.imageUrl"
                  :src="game.opponentCharacter.imageUrl"
                  :alt="game.opponentCharacter.name"
                  class="w-9 h-9 rounded-lg object-cover ring-1 ring-white/[0.08]"
                />
                <span class="text-[11px] text-zinc-500 hidden sm:block">{{ game.opponentCharacter?.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>
