<script setup lang="ts">
import { type SubmissionsItem, type Subreddit } from '@/model/subreddit'
import SubredditInfoBar from '@/components/SubredditInfoBar.vue'
import { computed, defineAsyncComponent, ref, type PropType, onMounted, watch } from 'vue'
import { getSubmissions, getSubredditByName } from '@/model/subreddit'
import { useRoute } from 'vue-router';
const route = useRoute();
const PostListItem = defineAsyncComponent(() => import('../components/PostListItem.vue'))

watch(
  () => route.params.subreddit,
  async newSubreddit => {
    console.log('newSubreddit', newSubreddit);
    currentPage.value = makeString(newSubreddit);
    dataInit();
  }
)
const makeString = (str: string | string[]) =>
  Array.isArray(str) ? str[0].toString() : str.toString()


const currentPage = ref<string>(makeString(route.params.subreddit));

const subreddit = ref<Subreddit>();
const submissions = ref<SubmissionsItem[]>([]);
console.log('currentPage.value', currentPage.value);
function dataInit() {
  getSubredditByName(currentPage.value).then((envelope) => {
    subreddit.value = envelope.data;
  });

  getSubmissions(currentPage.value).then((envelope) => {
    submissions.value = envelope.data;
  });
}
dataInit();


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
