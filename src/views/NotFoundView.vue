<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-[#07080F] flex items-center justify-center">
    <div class="text-center">
      <p class="text-[9rem] font-black text-amber-400/10 leading-none mb-4 select-none">404</p>
      <h1 class="text-2xl font-black text-zinc-100 mb-2">Page introuvable</h1>
      <p class="text-zinc-500 text-sm mb-10">Cette page n'existe pas ou la partie est terminée.</p>
      <button
        @click="router.push('/')"
        class="bg-amber-500 hover:bg-amber-400 text-[#07080F] font-black px-8 py-3 rounded-xl transition-colors text-sm"
      >
        Retour à l'accueil
      </button>
    </div>
  </div>
</template>
