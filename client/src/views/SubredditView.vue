<script setup lang="ts">
import { type SubmissionsItem, type Subreddit } from '@/model/subreddit'
import SubredditInfoBar from '@/components/SubredditInfoBar.vue'
import { computed, defineAsyncComponent, ref, type PropType } from 'vue'
import { getSubmissions, getSubredditByName } from '@/model/subreddit'
import { useRoute } from 'vue-router';
const route = useRoute();
const PostListItem = defineAsyncComponent(() => import('../components/PostListItem.vue'))

const currentPage = computed(() => {
  const str = route.params.subreddit
  console.log('str', str);
  if (typeof str === 'string') {
    return str;
  }else {
    return str.join(' ');
  }
});
const subreddit = ref<Subreddit>();
const submissions = ref<SubmissionsItem[]>([]);
console.log('currentPage.value', currentPage.value);
getSubredditByName(currentPage.value).then((envelope) => {
  subreddit.value = envelope.data;
  console.log("envelope",envelope);
});

getSubmissions(currentPage.value).then((envelope) => {
  submissions.value = envelope.data;
  console.log("envelope",envelope);
});


</script>

<template>
  <div v-if="subreddit" class="flex flex-row">
    <div> {{ subreddit.display_name }}</div>
    <div class="flex flex-col">
      <div v-for="submission in submissions" :key="submission._id" class="col-span-1">
        <PostListItem :post="submission" />
      </div>
    </div>
    <SubredditInfoBar v-if="subreddit" :subreddit="subreddit" class="hidden md:block w-2/3" />
  </div>
  <div v-else>Subreddit not found</div>
</template>

<style scoped></style>
