<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import { ref } from 'vue'



</script>

<template>
  <div class="flex flex-col min-h-screen">
    <NavBar />
    <RouterView />
    <Footer />
  </div>
</template>

<style scoped>

</style>

