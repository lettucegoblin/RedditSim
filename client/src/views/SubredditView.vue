<script setup lang="ts">
import { type PostItem } from '@/model/subreddit'
import SubredditInfoBar from '@/components/SubredditInfoBar.vue'
import { computed, defineAsyncComponent, type PropType } from 'vue'
import { getPosts, getSubredditByName } from '@/model/subreddit'
import { useRoute } from 'vue-router';
const route = useRoute();
const PostListItem = defineAsyncComponent(() => import('../components/PostListItem.vue'))

const subreddit = computed(() => {
  const subredditName = route.path as string
  return getSubredditByName(subredditName)
})


</script>

<template>
  <div v-if="subreddit" class="flex flex-row">
    <div> {{ subreddit.name }}</div>
    <div class="flex flex-col">
      <div v-for="post in getPosts(subreddit.name)" :key="post.id" class="col-span-1">
        <PostListItem :post="post" />
      </div>
    </div>
    <SubredditInfoBar v-if="subreddit" :subreddit="subreddit" class="hidden md:block w-2/3" />
  </div>
  <div v-else>Subreddit not found</div>
</template>

<style scoped></style>
