<script setup lang="ts">
import type { User, UserPending} from '@/model/session';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { createUser } from '@/model/session';
import { getSession, useLogin } from '@/model/session'

const route = useRoute();
const username = ref('');
const passcode = ref('');
const { login, logout } = useLogin();

const submit = () => {
  login(username.value, passcode.value)
}
</script>

<template>
  <div class="flex justify-center items-center h-screen">
    <div class="w-1/3">
      <h1 class="text-3xl font-bold mb-4">Sign In</h1>
      <form @submit.prevent="submit">
        <div class="mb-4">
          <label for="username" class="block mb-2">Username</label>
          <input autocomplete="username" id="username" v-model="username" type="text" class="w-full px-4 py-2 border rounded" />
        </div>
        <div class="mb-4">
          <label for="passcode" class="block mb-2">Passcode</label>
          <input autocomplete="password" id="passcode" v-model="passcode" type="password" class="w-full px-4 py-2 border rounded" />
        </div>
        <button type="submit" class="w-full bg-blue-500 text-white py-2 px-4 rounded">Sign In</button>
      </form>
    </div>
  </div>
</template>

<style scoped>

</style>