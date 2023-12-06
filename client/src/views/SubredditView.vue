<script setup lang="ts">
import { type SubmissionsItem, type Subreddit } from '@/model/subreddit'
import SubredditInfoBar from '@/components/SubredditInfoBar.vue'
import { computed, defineAsyncComponent, ref, type PropType, onMounted, watch } from 'vue'
import { getSubmissions, getSubredditByName } from '@/model/subreddit'
import { useRoute } from 'vue-router';
import PostModal from '@/components/PostModal.vue';
const route = useRoute();
const PostListItem = defineAsyncComponent(() => import('../components/PostListItem.vue'))

watch(
  () => route.params.subreddit,
  async newSubreddit => {
    submissions.value = [];
    toBeGenerated.value = 0;
    currentSubreddit.value = makeString(newSubreddit);
    subreddit.value = undefined;
    console.log('currentSubreddit', currentSubreddit.value);
    dataInit();
  }
)
const makeString = (str: string | string[]) =>
  Array.isArray(str) ? str[0].toString() : str ? str.toString() : "all";


const currentSubreddit = ref<string>(makeString(route.params.subreddit));

const subreddit = ref<Subreddit>();
const submissions = ref<SubmissionsItem[]>([]);
const page = ref(1);
const pageSize = ref(400);

const toBeGenerated = ref(0);
const maxToBeGenerated = 0;

console.log('currentSubreddit.value', currentSubreddit.value);
function dataInit() {

  getSubredditByName(currentSubreddit.value).then((envelope) => {
    subreddit.value = envelope.data;
    getSubmissions(currentSubreddit.value, page.value, pageSize.value).then((envelope) => {
      console.log("envelope", envelope);
      const { data, total } = envelope;
      /*
      toBeGenerated.value = pageSize.value - data.length;
      if (toBeGenerated.value > maxToBeGenerated ) {
        toBeGenerated.value = maxToBeGenerated;
      }*/
      if(data.length <= 2)
        toBeGenerated.value = 2 - data.length;
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

function createAndAddPendingSubmission(subreddit: string) {
  const pendingData = createPendingSubmission(subreddit);
  submissions.value.unshift(pendingData);
}

const submissionModalVisible = ref(false);
const submissionModal = ref({} as SubmissionsItem);


function openSubmissionModal(submission: SubmissionsItem) {
  console.log('openSubmissionModal', JSON.stringify(submission));
  submissionModal.value = submission;
  submissionModalVisible.value = true;
}

</script>

<template>
  
  <div v-if="subreddit">
    <PostModal v-if="submissionModalVisible" :post="submissionModal" @hideSubmissionModal="submissionModalVisible = false" />

    <div class="flex flex-col w-4/5">
      <div class="flex justify-center">
        <button @click="createAndAddPendingSubmission(currentSubreddit)"
          class="w-72 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-b-2xl dark:bg-gray-900">
          Generate New Submission
        </button>
      </div>

      <div v-for="submission in submissions" :key="submission._id" class="col-span-1">
        <PostListItem :post="submission" @openSubmissionModal="openSubmissionModal" />
      </div>

    </div>
    <SubredditInfoBar v-if="subreddit" :subreddit="subreddit" class="hidden md:block w-1/5" />
  </div>
  <div v-else>Loading...{{ currentSubreddit }}</div>
</template>

<style scoped></style> 
