<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCharacters, getGame } from '../services/api'
import { connectWS, sendGuess, sendChat, disconnectWS } from '../services/ws'
import type { Character, GameEvent } from '../types'

const route = useRoute()
const router = useRouter()
const gameCode = route.params.code as string

const characters = ref<Character[]>([])
const myCharacter = ref<Character | null>(null)
const characterRevealed = ref(false)
const eliminated = ref<Set<number>>(new Set())
const result = ref<'WIN' | 'LOSE' | null>(null)
const opponentCharacter = ref<Character | null>(null)
const gameAborted = ref(false)

const chatMessages = ref<Array<{ sender: string; content: string }>>([])
const chatInput = ref('')
const chatOpen = ref(false)
const chatScrollRef = ref<HTMLElement | null>(null)

const activeCharacters = computed(() => characters.value.filter(c => !eliminated.value.has(c.id)))

const guessQuery = ref('')
const showGuessDropdown = ref(false)
const guessSent = ref(false)
const guessResults = computed(() => {
  if (!guessQuery.value.trim()) return []
  const q = guessQuery.value.toLowerCase()
  return characters.value.filter(c => c.name.toLowerCase().includes(q)).slice(0, 6)
})

function closeGuessDropdown() {
  setTimeout(() => { showGuessDropdown.value = false }, 150)
}

function handleEvent(event: GameEvent) {
  if (event.type === 'GAME_START') {
    myCharacter.value = event.character!
  } else if (event.type === 'GAME_RESULT') {
    result.value = event.result!
    opponentCharacter.value = event.opponentCharacter!
  } else if (event.type === 'CHAT') {
    chatMessages.value.push({ sender: event.sender!, content: event.content! })
    nextTick(() => {
      if (chatScrollRef.value) chatScrollRef.value.scrollTop = chatScrollRef.value.scrollHeight
    })
  } else if (event.type === 'ERROR') {
    guessSent.value = false
  }
}

onMounted(async () => {
  if (history.state?.character) {
    myCharacter.value = history.state.character
  } else {
    const saved = localStorage.getItem(`char-${gameCode}`)
    if (saved) myCharacter.value = JSON.parse(saved)
  }

  try {
    const game = (await getGame(gameCode)).data
    if (game.status === 'FINISHED') {
      gameAborted.value = true
      return
    }
  } catch {
    router.push('/lobby')
    return
  }

  try {
    characters.value = (await getCharacters()).data
  } catch (error: any) {
    if (error.response?.status !== 401) router.push('/lobby')
    return
  }
  const token = localStorage.getItem('token')!
  connectWS(token, gameCode, handleEvent, () => { gameAborted.value = true })
})

onUnmounted(() => disconnectWS())

function confirmCharacter() {
  characterRevealed.value = true
}

function toggleEliminate(id: number) {
  const next = new Set(eliminated.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  eliminated.value = next
}

function confirmGuess(char: Character) {
  if (guessSent.value) return
  guessSent.value = true
  sendGuess(gameCode, char.id)
  guessQuery.value = ''
  showGuessDropdown.value = false
}

function backToLobby() {
  router.push('/lobby')
}

function sendChatMessage() {
  if (!chatInput.value.trim()) return
  sendChat(gameCode, chatInput.value.trim())
  chatInput.value = ''
}
</script>

<template>
  <div class="min-h-screen bg-[#07080F]">

    <!-- Overlay : révélation du personnage -->
    <div v-if="myCharacter && !characterRevealed" class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div class="bg-[#0D1120] border border-white/[0.08] rounded-3xl p-10 text-center max-w-xs w-full mx-4">
        <p class="text-amber-400 text-[10px] uppercase tracking-[0.3em] font-medium mb-6">Ton personnage</p>
        <div class="relative inline-block mb-5">
          <div class="absolute inset-0 rounded-2xl bg-amber-400/10 blur-xl scale-110"></div>
          <img
            :src="myCharacter.imageUrl"
            :alt="myCharacter.name"
            class="relative w-36 h-36 rounded-2xl object-cover ring-1 ring-amber-400/40"
          />
        </div>
        <h2 class="text-2xl font-black text-zinc-100 mb-1">{{ myCharacter.name }}</h2>
        <p class="text-zinc-500 text-xs mb-8">C'est ce que ton adversaire doit deviner</p>
        <button
          @click="confirmCharacter"
          class="w-full bg-amber-500 hover:bg-amber-400 text-[#07080F] font-black py-3.5 rounded-xl transition-colors text-sm"
        >
          C'est parti !
        </button>
      </div>
    </div>

    <!-- Overlay : résultat -->
    <div v-if="result" class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div class="bg-[#0D1120] border border-white/[0.08] rounded-3xl p-10 text-center max-w-xs w-full mx-4">
        <p
          class="text-5xl font-black mb-1"
          :class="result === 'WIN' ? 'text-emerald-400' : 'text-rose-400'"
        >
          {{ result === 'WIN' ? 'Victoire' : 'Défaite' }}
        </p>
        <p class="text-zinc-500 text-xs mb-6 uppercase tracking-wide">Personnage adverse</p>
        <div class="relative inline-block mb-3">
          <img
            v-if="opponentCharacter"
            :src="opponentCharacter.imageUrl"
            :alt="opponentCharacter.name"
            class="w-28 h-28 rounded-xl object-cover ring-1 ring-white/[0.12]"
          />
        </div>
        <p class="text-zinc-200 font-bold mb-8 text-sm">{{ opponentCharacter?.name }}</p>
        <button
          @click="backToLobby"
          class="w-full bg-amber-500 hover:bg-amber-400 text-[#07080F] font-black py-3.5 rounded-xl transition-colors text-sm"
        >
          Retour au lobby
        </button>
      </div>
    </div>

    <!-- Overlay : adversaire parti -->
    <div v-if="gameAborted" class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div class="bg-[#0D1120] border border-white/[0.08] rounded-3xl p-10 text-center max-w-xs w-full mx-4">
        <p class="text-2xl font-black text-zinc-100 mb-3">Partie terminée</p>
        <p class="text-zinc-500 text-sm mb-8">Votre adversaire a quitté la partie.</p>
        <button
          @click="backToLobby"
          class="w-full bg-amber-500 hover:bg-amber-400 text-[#07080F] font-black py-3.5 rounded-xl transition-colors text-sm"
        >
          Retour au lobby
        </button>
      </div>
    </div>

    <!-- Header -->
    <header class="border-b border-white/[0.06] bg-[#07080F]/80 backdrop-blur sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="text-zinc-500 text-xs uppercase tracking-wider">Partie</span>
          <span class="font-mono font-black text-amber-400 text-base tracking-[0.15em]">{{ gameCode }}</span>
        </div>
        <div v-if="myCharacter && characterRevealed" class="flex items-center gap-2 sm:gap-3 bg-[#0D1120] border border-white/[0.06] rounded-xl px-3 sm:px-4 py-2 min-w-0">
          <span class="text-[10px] text-zinc-500 uppercase tracking-wide hidden sm:block shrink-0">Ton perso</span>
          <img
            :src="myCharacter.imageUrl"
            :alt="myCharacter.name"
            class="h-8 w-8 sm:h-9 sm:w-9 rounded-lg object-cover ring-1 ring-amber-400/40 shrink-0"
          />
          <span class="font-bold text-zinc-200 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{{ myCharacter.name }}</span>
        </div>
      </div>
    </header>

    <!-- Grille -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div class="mb-8 grid grid-cols-4 gap-1 sm:gap-2 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-11">
        <button
          v-for="char in characters"
          :key="char.id"
          @click="toggleEliminate(char.id)"
          class="relative rounded-xl overflow-hidden transition-all duration-150 active:scale-[0.96] border"
          :class="eliminated.has(char.id)
            ? 'border-rose-900/20 opacity-50'
            : 'border-white/[0.07] hover:border-amber-400/30'"
        >
          <!-- Slash diagonal sur les éliminés -->
          <div v-if="eliminated.has(char.id)" class="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div class="absolute w-[150%] h-px bg-rose-500/80 rotate-[-35deg] origin-center"></div>
          </div>
          <img
            :src="char.imageUrl"
            :alt="char.name"
            class="w-full aspect-square object-cover"
          />
          <p
            class="text-[10px] py-1.5 px-1.5 truncate text-center font-medium"
            :class="eliminated.has(char.id) ? 'text-rose-400/50 line-through' : 'text-zinc-400'"
          >
            {{ char.name }}
          </p>
        </button>
      </div>

      <!-- Guess input -->
      <div class="flex flex-col items-center gap-3 w-full max-w-md mx-auto">
        <div class="relative w-full">
          <input
            v-model="guessQuery"
            @focus="showGuessDropdown = true"
            @blur="closeGuessDropdown"
            :disabled="guessSent"
            placeholder="Deviner un personnage..."
            class="w-full bg-[#0D1120] border border-white/[0.08] text-zinc-100 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 placeholder-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          />
          <div
            v-if="showGuessDropdown && guessResults.length > 0"
            class="absolute bottom-full left-0 right-0 mb-2 bg-[#0D1120] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto z-10"
          >
            <button
              v-for="char in guessResults"
              :key="char.id"
              @mousedown="confirmGuess(char)"
              class="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-400/[0.05] transition-colors text-left group border-b border-white/[0.04] last:border-0"
            >
              <img :src="char.imageUrl" :alt="char.name" class="w-10 h-10 rounded-lg object-cover shrink-0" />
              <span class="text-sm text-zinc-300 font-medium group-hover:text-amber-300 transition-colors">{{ char.name }}</span>
            </button>
          </div>
        </div>
        <p class="text-[11px] text-zinc-600 font-mono tabular-nums">
          {{ activeCharacters.length }} personnage{{ activeCharacters.length > 1 ? 's' : '' }} restant{{ activeCharacters.length > 1 ? 's' : '' }}
        </p>
      </div>
    </main>

    <!-- Chat -->
    <div class="fixed bottom-4 right-4 z-20 flex flex-col items-end gap-2">
      <div
        v-if="chatOpen"
        class="bg-[#0D1120] border border-white/[0.08] rounded-2xl shadow-2xl w-72 max-w-[calc(100vw-2rem)] flex flex-col"
        style="height: 300px"
      >
        <div class="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
          <span class="text-xs font-bold text-zinc-300 uppercase tracking-wider">Chat</span>
          <button @click="chatOpen = false" class="text-zinc-600 hover:text-zinc-300 text-xs transition-colors">✕</button>
        </div>
        <div ref="chatScrollRef" class="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
          <p v-if="chatMessages.length === 0" class="text-[11px] text-zinc-700 text-center mt-4">Aucun message</p>
          <div v-for="(msg, i) in chatMessages" :key="i" class="text-xs">
            <span class="font-bold text-amber-400">{{ msg.sender }}</span>
            <span class="text-zinc-400 ml-1">{{ msg.content }}</span>
          </div>
        </div>
        <div class="p-2 border-t border-white/[0.06] flex gap-2 shrink-0">
          <input
            v-model="chatInput"
            @keyup.enter="sendChatMessage"
            placeholder="Message..."
            class="flex-1 bg-[#07080F] text-zinc-200 text-xs rounded-lg px-3 py-2 focus:outline-none border border-white/[0.06] focus:border-amber-400/30 placeholder-zinc-600 transition-colors"
          />
          <button
            @click="sendChatMessage"
            class="bg-amber-500 hover:bg-amber-400 text-[#07080F] text-xs px-3 rounded-lg font-black transition-colors"
          >
            &rarr;
          </button>
        </div>
      </div>
      <button
        @click="chatOpen = !chatOpen"
        class="bg-[#0D1120] border border-white/[0.08] hover:border-amber-400/30 text-zinc-300 rounded-full w-12 h-12 flex items-center justify-center shadow-lg text-[10px] font-bold transition-colors uppercase tracking-wide"
      >
        Chat
      </button>
    </div>

  </div>
</template>
