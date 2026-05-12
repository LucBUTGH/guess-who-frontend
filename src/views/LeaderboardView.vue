<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getLeaderboard } from '../services/api'
import type { PlayerStats } from '../types'

const router = useRouter()
const players = ref<PlayerStats[]>([])
const loading = ref(true)
const error = ref(false)

onMounted(async () => {
  try {
    players.value = (await getLeaderboard()).data
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#07080F]">

    <header class="border-b border-white/[0.06] bg-[#07080F]/80 backdrop-blur sticky top-0 z-10">
      <div class="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
        <button @click="router.back()" class="text-zinc-500 hover:text-zinc-200 text-sm transition-colors">&larr; Retour</button>
        <div class="w-px h-4 bg-white/[0.08]"></div>
        <h1 class="text-sm font-bold text-zinc-100">Classement</h1>
      </div>
    </header>

    <main class="max-w-2xl mx-auto px-6 py-12">

      <div class="mb-8">
        <p class="text-amber-400 text-xs uppercase tracking-[0.25em] font-medium mb-2">Global</p>
        <h2 class="text-3xl font-black text-zinc-100">Top joueurs</h2>
      </div>

      <div v-if="loading" class="text-center text-zinc-600 text-sm py-20">Chargement...</div>

      <div v-else-if="error" class="text-center text-rose-500 text-sm py-20">
        Impossible de charger le classement.
      </div>

      <div v-else-if="players.length === 0" class="text-center text-zinc-600 text-sm py-20">
        Aucun joueur pour l'instant.
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="(player, index) in players"
          :key="player.username"
          class="flex items-center gap-3 sm:gap-5 rounded-2xl px-4 sm:px-6 py-4 border transition-colors"
          :class="index === 0
            ? 'bg-amber-400/[0.06] border-amber-400/20'
            : 'bg-[#0D1120] border-white/[0.06]'"
        >
          <span
            class="text-xl font-black w-7 text-right tabular-nums font-mono shrink-0"
            :class="index === 0 ? 'text-amber-400' : index === 1 ? 'text-zinc-300' : index === 2 ? 'text-amber-700' : 'text-zinc-700'"
          >
            {{ index + 1 }}
          </span>

          <div class="w-px h-5 bg-white/[0.06] shrink-0"></div>

          <span class="flex-1 font-bold text-zinc-100 text-sm">{{ player.username }}</span>

          <div class="flex items-center gap-3 sm:gap-5 text-xs font-mono tabular-nums shrink-0">
            <div class="text-right">
              <p class="text-emerald-400 font-bold text-sm sm:text-base leading-none">{{ player.wins }}</p>
              <p class="text-zinc-600 text-[10px] mt-0.5 uppercase tracking-wide">V</p>
            </div>
            <div class="text-right">
              <p class="text-rose-400 font-bold text-sm sm:text-base leading-none">{{ player.losses }}</p>
              <p class="text-zinc-600 text-[10px] mt-0.5 uppercase tracking-wide">D</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-sm sm:text-base leading-none" :class="index === 0 ? 'text-amber-400' : 'text-zinc-400'">
                {{ player.wins + player.losses > 0 ? Math.round(player.wins / (player.wins + player.losses) * 100) : 0 }}%
              </p>
              <p class="text-zinc-600 text-[10px] mt-0.5 uppercase tracking-wide">WR</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
