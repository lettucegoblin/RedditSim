<script setup lang="ts">
import type { User, UserPending } from '@/model/session';
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

  if (!envelope.isSuccessful) {
    console.log('user not created');
    return;
  }
  console.log('user', envelope);

  await login(newUser.username, newUser.passcode)
}
</script>

<template>
  <div class="flex flex-col items-center mt-8">
    <h1 class="text-2xl font-bold mb-4">Sign Up</h1>
    <form @submit.prevent="submit" class="flex flex-col space-y-4">
      <label for="username" class="text-lg">Username</label>
      <input autocomplete="username" id="username" v-model="username" type="text" class="border border-gray-300 rounded-md p-2" />
      <label for="passcode" class="text-lg">Passcode</label>
      <input autocomplete="password" id="passcode" v-model="passcode" type="password" class="border border-gray-300 rounded-md p-2" />
      <button type="submit" class="bg-blue-500 text-white py-2 px-4 rounded-md">Sign Up</button>
    </form>
  </div>
</template>

<style scoped></style>