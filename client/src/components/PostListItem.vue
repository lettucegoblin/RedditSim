
<script setup lang="ts">
import { defineProps } from 'vue'

export interface CommentItem {
  id: number;
  author: string;
  timestamp: number;
  content: string;
}

export interface PostItem {
  id: number;
  title: string;
  author: string;
  timestamp: number;
  content: string;
  upvotes: number;
  downvotes: number;
  comments: CommentItem[];
}



const props = defineProps({
  post: {
    type: Object as () => PostItem,
    required: true
  }
})

function formatDate(timestamp: number): string {
  // Format the date however you like
  return new Date(timestamp).toLocaleDateString()
}
</script>

<template>
  <div class="rounded-2xl p-4 mx-8 mb-4 hover:bg-slate-200 dark:hover:bg-reddit-highlight-dark">
    <h2>{{ post.title }}</h2>
    <p>{{ post.content }}</p>
    <p>Posted by {{ post.author }} on {{ formatDate(post.timestamp) }}</p>
  </div>
</template>

<style scoped>
.post-list-item {
  border: 1px solid #ccc;
  padding: 1rem;
  margin-bottom: 1rem;
}
</style>
