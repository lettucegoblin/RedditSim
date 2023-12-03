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
   
    currentSubreddit.value = makeString(newSubreddit);
    console.log('currentSubreddit', currentSubreddit.value );
    dataInit();
  }
)
const makeString = (str: string | string[]) =>
  Array.isArray(str) ? str[0].toString() : str ? str.toString() : "all";


const currentSubreddit = ref<string>(makeString(route.params.subreddit));

const subreddit = ref<Subreddit>();
const submissions = ref<SubmissionsItem[]>([]);
const page = ref(1);
const pageSize = ref(10);

const toBeGenerated = ref(0);

console.log('currentSubreddit.value', currentSubreddit.value);
function dataInit() {
  getSubredditByName(currentSubreddit.value).then((envelope) => {
    subreddit.value = envelope.data;
    getSubmissions(currentSubreddit.value, page.value, pageSize.value).then((envelope) => {
      console.log("envelope", envelope);
      const { data, total } = envelope;
      toBeGenerated.value = pageSize.value - data.length;
      if (toBeGenerated.value > 0) {
        //toBeGenerated.value = 1 // temporary
      }
      // add pending items to data
      const pendingDataArr = [];
      for (let i = 0; i < toBeGenerated.value; i++) {
        const pendingData = createPendingSubmission(currentSubreddit.value);
        pendingDataArr.push(pendingData);
      }

      console.log("toBeGenerated", toBeGenerated.value)
      submissions.value = [...pendingDataArr, data].flat();
    });
  });

  
}
dataInit();

function createPendingSubmission(subreddit: string): SubmissionsItem {
  const pendingData = {
        timestamp: Date.now(),
        pending: true,
      } as SubmissionsItem;
  if (subreddit)
    pendingData['subreddit'] = subreddit;
  return pendingData;
}


</script>

<template>
  <div v-if="subreddit">
    <div class="flex flex-col w-4/5">
      <div v-for="submission in submissions" :key="submission._id" class="col-span-1">
        <PostListItem :post="submission" />
      </div>
      
    </div>
    <SubredditInfoBar v-if="subreddit" :subreddit="subreddit" class="hidden md:block w-1/5" />
  </div>
  <div v-else>Subreddit not found</div>
</template>

<style scoped></style>
