<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login, register } from '../services/api'

const router = useRouter()
const mode = ref<'login' | 'register'>('login')
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const res = mode.value === 'login'
      ? await login(username.value, password.value)
      : await register(username.value, password.value)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('username', username.value)
    router.push('/')
  } catch {
    error.value = mode.value === 'login'
      ? 'Identifiants incorrects.'
      : "Nom d'utilisateur déjà pris."
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#07080F] flex items-center justify-center p-4 relative overflow-hidden">

    <div aria-hidden="true" class="pointer-events-none fixed inset-0 overflow-hidden">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[50rem] h-[30rem] rounded-full bg-amber-500/[0.04] blur-3xl"></div>
      <div class="absolute bottom-0 right-0 w-[25rem] h-[25rem] rounded-full bg-indigo-500/[0.03] blur-3xl"></div>
    </div>

    <div class="w-full max-w-sm relative">

      <div class="text-center mb-10">
        <p class="text-amber-400 text-xs uppercase tracking-[0.3em] font-medium mb-4">Genshin Impact Edition</p>
        <h1 class="text-5xl font-black text-zinc-100 tracking-tight">Guess Who</h1>
        <div class="w-12 h-px bg-amber-400/60 mx-auto mt-4"></div>
      </div>

      <div class="bg-[#0D1120] border border-white/[0.07] rounded-2xl overflow-hidden">

        <div class="flex border-b border-white/[0.06]">
          <button
            @click="mode = 'login'"
            :class="[
              'flex-1 py-4 text-sm font-semibold transition-all duration-200 border-b-2',
              mode === 'login'
                ? 'text-amber-400 border-amber-400'
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
            ]"
          >
            Se connecter
          </button>
          <button
            @click="mode = 'register'"
            :class="[
              'flex-1 py-4 text-sm font-semibold transition-all duration-200 border-b-2',
              mode === 'register'
                ? 'text-amber-400 border-amber-400'
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
            ]"
          >
            S'inscrire
          </button>
        </div>

        <div class="p-8">
          <div v-if="mode === 'register'" class="mb-6 p-3 rounded-xl bg-amber-400/[0.06] border border-amber-400/20 text-center">
            <p class="text-amber-300/80 text-xs">Crée ton compte pour commencer à jouer</p>
          </div>

          <div class="mb-4">
            <label class="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wide">Nom d'utilisateur</label>
            <input
              v-model="username"
              type="text"
              placeholder="Ton pseudo"
              @keyup.enter="submit"
              class="w-full bg-[#07080F] border border-white/[0.08] rounded-xl px-4 py-3 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all"
            />
          </div>

          <div class="mb-7">
            <label class="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wide">Mot de passe</label>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              @keyup.enter="submit"
              class="w-full bg-[#07080F] border border-white/[0.08] rounded-xl px-4 py-3 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all"
            />
          </div>

          <p v-if="error" class="mb-5 text-xs text-rose-400 text-center">{{ error }}</p>

          <button
            :disabled="loading"
            @click="submit"
            class="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-[#07080F] font-black py-3.5 rounded-xl transition-colors text-sm tracking-wide"
          >
            {{ loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
