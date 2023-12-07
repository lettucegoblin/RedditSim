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
  const newUser = {
    username: username.value,
    passcode: passcode.value,
    createdAt: Date.now(),
  } as UserPending;
  console.log('submit', newUser);
  const envelope = await createUser(newUser);
  if (!envelope.isSuccess) {
    console.log('user not created');
    return;
  }
  console.log('user', envelope);
  login(newUser.username, newUser.passcode)
}
</script>

<template>
  <div>
    <h1>Sign Up</h1>
    <form @submit.prevent="submit">
      <label for="username">Username</label>
      <input id="username" v-model="username" type="text" />
      <label for="passcode">Passcode</label>
      <input id="passcode" v-model="passcode" type="password" />
      <button type="submit">Sign Up</button>
    </form>
  </div>
</template>

<style scoped>

</style>