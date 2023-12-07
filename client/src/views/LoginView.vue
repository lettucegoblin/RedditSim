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

const submit = async () => {
  login(username.value, passcode.value)
}
</script>

<template>
  <div>
    <h1>Sign In</h1>
    <form @submit.prevent="submit">
      <label for="username">Username</label>
      <input id="username" v-model="username" type="text" />
      <label for="passcode">Passcode</label>
      <input id="passcode" v-model="passcode" type="password" />
      <button @click="submit" type="submit">Sign In</button>
    </form>
  </div>
</template>

<style scoped>

</style>