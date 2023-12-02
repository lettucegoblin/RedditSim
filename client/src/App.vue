<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import { ref } from 'vue'
import SideBar from './components/SideBar.vue'
</script>

<template>
  <RouterLink :to="{ name: 'subreddit', params: { subreddit: 'aww' } }">
    aww
  </RouterLink>

  <RouterLink :to="{ name: 'subreddit', params: { subreddit: 'AITA' } }">
    AITA
  </RouterLink>
  <div class="flex flex-col min-h-screen mx-auto px-2 sm:px-6 lg:px-8">
    <NavBar />

    <div class="flex">
      <SideBar class="hidden lg:block w-1/5" />
      <RouterView class="w-4/5" />
    </div>

    <Footer />
  </div>
</template>

<style scoped></style>
