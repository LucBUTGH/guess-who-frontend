<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createGame, joinGame, getPlayerStats } from '../services/api'
import { connectWS, disconnectWS } from '../services/ws'
import type { GameEvent, PlayerStats } from '../types'

const router = useRouter()
const username = localStorage.getItem('username') || ''
const joinCode = ref('')
const error = ref('')
const loading = ref(false)
const waitingCode = ref<string | null>(null)
const copied = ref(false)
const stats = ref<PlayerStats | null>(null)

function handleEvent(event: GameEvent) {
  if (event.type === 'GAME_START') {
    localStorage.setItem(`char-${waitingCode.value}`, JSON.stringify(event.character))
    router.push({ path: `/game/${waitingCode.value}`, state: { character: event.character } })
  }
}

onMounted(async () => {
  try {
    stats.value = (await getPlayerStats()).data
  } catch {}
})

async function create() {
  error.value = ''
  loading.value = true
  try {
    const res = await createGame()
    waitingCode.value = res.data.code
    const token = localStorage.getItem('token')!
    connectWS(token, res.data.code, handleEvent, () => {
      waitingCode.value = null
      error.value = 'La partie a été annulée.'
    })
  } catch {
    error.value = 'Impossible de créer la partie.'
  } finally {
    loading.value = false
  }
}

async function join() {
  if (!joinCode.value) return
  error.value = ''
  loading.value = true
  try {
    const token = localStorage.getItem('token')!
    waitingCode.value = joinCode.value
    await connectWS(token, joinCode.value, handleEvent, () => {
      error.value = 'La partie a été annulée.'
    })
    await joinGame(joinCode.value)
  } catch {
    error.value = 'Code invalide ou partie introuvable.'
  } finally {
    loading.value = false
  }
}

function logout() {
  disconnectWS()
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  router.push('/login')
}

async function copyCode() {
  if (!waitingCode.value) return
  await navigator.clipboard.writeText(waitingCode.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <div class="min-h-screen bg-[#07080F]">

    <div aria-hidden="true" class="pointer-events-none fixed inset-0 overflow-hidden">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[50rem] h-[30rem] rounded-full bg-amber-500/[0.04] blur-3xl"></div>
    </div>

    <header class="border-b border-white/[0.06] bg-[#07080F]/80 backdrop-blur sticky top-0 z-10">
      <div class="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <router-link to="/" class="group flex items-baseline gap-2">
            <span class="text-base font-black text-zinc-100 tracking-tight group-hover:text-amber-400 transition-colors">Guess Who</span>
          </router-link>
          <div class="w-px h-4 bg-white/[0.08]"></div>
          <span class="text-zinc-500 text-xs uppercase tracking-widest">Lobby</span>
        </div>
        <div class="flex items-center gap-4">
          <div v-if="stats" class="hidden sm:flex items-center gap-3 text-xs font-mono">
            <span class="text-emerald-400">{{ stats.wins }}V</span>
            <span class="text-rose-400">{{ stats.losses }}D</span>
          </div>
          <span class="text-sm text-zinc-500 hidden sm:block">{{ username }}</span>
          <button
            @click="logout"
            class="text-xs text-zinc-500 hover:text-zinc-200 transition-colors px-3 py-1.5 rounded-lg border border-white/[0.06] hover:border-white/[0.12]"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-6 py-14">

      <!-- Waiting state -->
      <div v-if="waitingCode" class="flex flex-col items-center justify-center py-16 text-center">
        <p class="text-amber-400 text-[10px] uppercase tracking-[0.3em] font-medium mb-12">En attente d'un adversaire</p>

        <div class="relative mb-10">
          <div class="absolute inset-0 rounded-3xl bg-amber-400/[0.06] blur-3xl scale-150 pointer-events-none"></div>
          <div class="relative bg-[#0D1120] border border-amber-400/20 rounded-2xl px-8 py-6 sm:px-16 sm:py-8">
            <p class="text-[10px] text-zinc-600 uppercase tracking-[0.3em] mb-4">Code de la partie</p>
            <p class="text-5xl sm:text-7xl font-black tracking-[0.15em] text-amber-400 font-mono select-all">{{ waitingCode }}</p>
          </div>
        </div>

        <button
          @click="copyCode"
          class="text-xs font-semibold px-5 py-2.5 rounded-xl transition-all border"
          :class="copied
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            : 'bg-transparent text-zinc-500 border-white/[0.08] hover:text-zinc-200 hover:border-white/[0.16]'"
        >
          {{ copied ? 'Copié !' : 'Copier le code' }}
        </button>

        <div class="flex items-center gap-2 mt-14 text-zinc-700 text-xs">
          <div class="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-pulse"></div>
          <span>En attente de connexion...</span>
        </div>
      </div>

      <!-- Create / Join -->
      <template v-else>
        <div class="mb-12">
          <p class="text-amber-400 text-[10px] uppercase tracking-[0.3em] font-medium mb-3">Prêt ?</p>
          <h2 class="text-4xl sm:text-5xl font-black text-zinc-100 tracking-tight">Nouvelle partie</h2>
        </div>

        <div class="grid gap-6 sm:grid-cols-2">

          <div class="bg-[#0D1120] border border-white/[0.06] rounded-2xl p-8 flex flex-col gap-6">
            <div>
              <h3 class="text-lg font-black text-zinc-100 mb-1">Créer</h3>
              <p class="text-xs text-zinc-600 leading-relaxed">Lance une nouvelle partie et partage le code avec ton adversaire</p>
            </div>
            <button
              :disabled="loading"
              @click="create"
              class="mt-auto w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-[#07080F] font-black py-3.5 rounded-xl transition-colors text-sm tracking-wide"
            >
              Créer une partie
            </button>
          </div>

          <div class="bg-[#0D1120] border border-white/[0.06] rounded-2xl p-8 flex flex-col gap-6">
            <div>
              <h3 class="text-lg font-black text-zinc-100 mb-1">Rejoindre</h3>
              <p class="text-xs text-zinc-600 leading-relaxed">Entre le code que ton adversaire t'a communiqué</p>
            </div>
            <div class="mt-auto flex gap-2">
              <input
                v-model="joinCode"
                type="text"
                placeholder="XXXXXX"
                @keyup.enter="join"
                class="flex-1 min-w-0 bg-[#07080F] border border-white/[0.08] rounded-xl px-4 py-3.5 text-zinc-100 text-sm placeholder-zinc-700 font-mono tracking-[0.2em] uppercase focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all"
              />
              <button
                :disabled="loading || !joinCode"
                @click="join"
                class="bg-[#121929] hover:bg-[#1e2d47] disabled:opacity-40 border border-white/[0.08] hover:border-white/[0.16] text-zinc-300 font-black px-5 py-3.5 rounded-xl transition-all text-sm shrink-0"
              >
                OK
              </button>
            </div>
          </div>

        </div>

        <p v-if="error" class="mt-6 text-xs text-rose-400 text-center">{{ error }}</p>
      </template>

    </main>
  </div>
</template>
