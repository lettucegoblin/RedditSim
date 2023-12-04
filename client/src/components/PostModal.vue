<script setup lang="ts">
import type { SubmissionsItem } from '@/model/subreddit';
import { ref } from 'vue';

const props = defineProps({
  post: {
    type: Object as () => SubmissionsItem,
    required: true
  }
})

const post = ref(props.post)
const emit = defineEmits(['hideSubmissionModal'])

const hideSubmissionModal = () => {
  console.log('hideSubmissionModal')
  emit('hideSubmissionModal')
}
</script>

<template>
  <div id="SubmissionModalWrapper" class="absolute top-0 left-0 w-full h-full flex items-center justify-center">
    <div id="hideSubmissionModal" class="rounded-xl bg-gray-100 dark:bg-reddit-neutral-background-dark fixed z-50 w-11/12 overflow-y-scroll h-5/6">
      <div class=" rounded-lg p-6">
        <h2>{{ post.title }}</h2>
        <p>{{ post.author }}</p>
        <p>Created at: {{ post.text }}</p>
      </div>
    </div>
    <div id="hideSubmissionModal_blackout" @click="hideSubmissionModal" class="fixed inset-0 bg-black opacity-25"></div>
  </div>
</template>

<style scoped></style>