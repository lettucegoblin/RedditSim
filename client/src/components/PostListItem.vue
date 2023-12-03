<script setup lang="ts">
import type { SubmissionsItem } from '@/model/subreddit';
import { computed, defineProps } from 'vue'

const props = defineProps({
  post: {
    type: Object as () => SubmissionsItem,
    required: true
  }
})

if(props.post.pending) {
  console.log('props.post.pending', props.post.pending);
}

function formatDate(timestamp: number): string {
  // Format the date however you like
  return new Date(timestamp).toLocaleDateString()
}
</script>

<template>
  <div v-if="!post.pending" class="rounded-2xl p-4 mx-8 mb-4 hover:bg-slate-200 dark:hover:bg-reddit-highlight-dark">
    <h2>{{ post.title }}</h2>
    <p>{{ post.text }}</p>
    <p>Posted by {{ post.author }} on {{ formatDate(post.timestamp) }}</p>
  </div>
  <div v-else class="rounded-2xl p-4 mx-8 mb-4 bg-slate-200 dark:bg-reddit-highlight-dark">
    <h2>Loading...</h2>
  </div>
</template>

<style scoped>
.post-list-item {
  border: 1px solid #ccc;
  padding: 1rem;
  margin-bottom: 1rem;
}
</style>
