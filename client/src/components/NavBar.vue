<template>
  <header>
    <img alt="Vue logo" class="logo shadow-md" src="@/assets/logo.png" width="125" height="125" />
    <!-- add svg with name -->
    <h1 class="text-xl">RedditSim</h1>

    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
      
      
      <button @click=toggleDarkMode type="button" class="btn btn-primary">
        <font-awesome-icon :icon="darkMode ? 'moon' : 'sun'" />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const darkMode = ref(true)

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  if (darkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}
</script>

<style scoped>

</style>