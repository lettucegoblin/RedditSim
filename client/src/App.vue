<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import { ref } from 'vue'
import SideBar from './components/SideBar.vue'

</script>

<template>

  <div class="flex flex-col min-h-screen mx-auto px-2 sm:px-6 lg:px-8">
    <NavBar />

    <div class="flex w-full">
      <SideBar class="hidden md:block w-1/5" />
      <RouterView class="flex flex-row w-4/5"/>
    </div>

    <Footer />
  </div>
</template>

<style scoped></style>
