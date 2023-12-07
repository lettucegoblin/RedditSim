<script setup lang="ts">
import { type SubmissionsItem, type Subreddit } from '@/model/subreddit'
import SubredditInfoBar from '@/components/SubredditInfoBar.vue'
import { computed, defineAsyncComponent, ref, type PropType, onMounted, watch } from 'vue'
import { getSubmissions, getSubredditByName } from '@/model/subreddit'
import { useRoute } from 'vue-router'
import PostModal from '@/components/PostModal.vue'
const route = useRoute()
const PostListItem = defineAsyncComponent(() => import('../components/PostListItem.vue'))

watch(
  () => route.params.subreddit,
  async (newSubreddit) => {
    submissions.value = []
    toBeGenerated.value = 0
    currentSubreddit.value = makeString(newSubreddit)
    subreddit.value = undefined
    console.log('currentSubreddit', currentSubreddit.value)
    dataInit()
  }
)
const makeString = (str: string | string[]) =>
  Array.isArray(str) ? str[0].toString() : str ? str.toString() : 'all'

const currentSubreddit = ref<string>(makeString(route.params.subreddit))

const subreddit = ref<Subreddit>()
const submissions = ref<SubmissionsItem[]>([])
const pendingSubmissions = ref<SubmissionsItem[]>([])
const page = ref(1)
const pageSize = ref(5)
const totalSubmissions = ref(0)

const toBeGenerated = ref(0)
const maxToBeGenerated = 0

console.log('currentSubreddit.value', currentSubreddit.value)
function dataInit() {
  console.log('dataInit', page.value, pageSize.value, totalSubmissions.value)
  // initize refs
  page.value = 1
  pageSize.value = 5
  totalSubmissions.value = 0
  toBeGenerated.value = 0
  getSubredditByName(currentSubreddit.value).then((envelope) => {
    subreddit.value = envelope.data
    getSubmissions(currentSubreddit.value, page.value, pageSize.value).then((envelope) => {
      console.log('envelope', envelope)
      const { data, total } = envelope
      totalSubmissions.value = total
      /*
      toBeGenerated.value = pageSize.value - data.length;
      if (toBeGenerated.value > maxToBeGenerated ) {
        toBeGenerated.value = maxToBeGenerated;
      }*/
      if (data.length <= 2) toBeGenerated.value = 2 - data.length
      // add pending items to data
      const pendingDataArr = []
      for (let i = 0; i < toBeGenerated.value; i++) {
        const pendingData = createPendingSubmission(currentSubreddit.value, undefined, undefined)
        pendingDataArr.push(pendingData)
      }
      pendingSubmissions.value = pendingDataArr

      console.log('toBeGenerated', toBeGenerated.value)
      submissions.value = data
      if (page.value * pageSize.value >= total) lazyLoadingVisible.value = false
      else lazyLoadingVisible.value = true
      //submissions.value = [...pendingDataArr, data].flat();
    })
  })
}
dataInit()

const loadMoreSubmissions = () => {
  console.log('loadMoreSubmissions')
  if(!isMorePages.value) return
  page.value++
  getSubmissions(currentSubreddit.value, page.value, pageSize.value).then((envelope) => {
    console.log('envelope', envelope)
    const { data, total } = envelope
    totalSubmissions.value = total
    submissions.value.push(...data)
    if (page.value * pageSize.value >= total) lazyLoadingVisible.value = false
    else lazyLoadingVisible.value = true
  })
}

const isMorePages = computed(() => {
  return page.value * pageSize.value < totalSubmissions.value
})

const lazyLoadingVisible = ref(false)

function createPendingSubmission(
  subreddit: string,
  postTitle: string | undefined,
  postMedia: string | undefined
): SubmissionsItem {

  const pendingData = {
    timestamp: Date.now(),
    pending: true
  } as SubmissionsItem
  if (subreddit) pendingData['subreddit'] = subreddit
  if (postTitle && postTitle.length > 0) pendingData['title'] = postTitle
  if (postMedia) pendingData['media'] = postMedia
  return pendingData
}

function createAndAddPendingSubmission(subreddit: string) {
  const pendingData = createPendingSubmission(
    subreddit,
    userInputSubmissionTitle.value,
    selectedMedia.value
  )
  pendingSubmissions.value.push(pendingData)
}

const submissionModalVisible = ref(false)
const submissionOptionsVisible = ref(false)
const submissionModal = ref({} as SubmissionsItem)
const selectedMedia = ref('text')
const userInputSubmissionTitle = ref('')

function openSubmissionModal(submission: SubmissionsItem) {
  console.log('openSubmissionModal', JSON.stringify(submission))
  submissionModal.value = submission
  submissionModalVisible.value = true
}
const solidifySubmission = (submission: SubmissionsItem) => {
  console.log('updatePendingStatus', submission)
  // for each pendingSubmission, if pending = false, remove it from pending Submissions
  pendingSubmissions.value = pendingSubmissions.value.filter((pendingSubmission) => {
    if (pendingSubmission.pending === false) {
      return false
    }
    return true
  })
  submissions.value.push(submission)
}

const submissionsSortedByTimestamp = computed(() => {
  return submissions.value.sort((a, b) => {
    return  b.timestamp  -a.timestamp
  })
})
const loadMoreButton = ref()

onMounted(() => {
  console.log('onMounted')
  // add event listener for scroll
  window.addEventListener('scroll', function () {
    if (!loadMoreButton.value) return
    if (!lazyLoadingVisible.value) return
    console.log('scroll')
    const rect = loadMoreButton.value.getBoundingClientRect();
    const offset = 200;
    const isVisible = rect.top- 400 <= (window.innerHeight || document.documentElement.clientHeight);
    if (isVisible && lazyLoadingVisible.value) {
      console.log('isVisible')
      lazyLoadingVisible.value = false
      loadMoreSubmissions()
    }
  })
})

</script>

<template>
  <div v-if="subreddit">
    <PostModal v-if="submissionModalVisible" :post="submissionModal"
      @hideSubmissionModal="submissionModalVisible = false" />

    <div class="flex flex-col w-4/5">
      <div class="flex justify-center">
        <button @click="submissionOptionsVisible = !submissionOptionsVisible"
          class="w-72 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-b-2xl dark:bg-gray-900">
          Open Options
        </button>
        <button @click="createAndAddPendingSubmission(currentSubreddit)"
          class="w-72 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-b-2xl dark:bg-gray-900">
          Generate Submission
        </button>
      </div>
      <div v-if="submissionOptionsVisible" class="flex justify-center">
        <!--title input, media radio-->
        <div class="flex flex-col">
          <label for="title">Title</label>
          <input type="text" id="title" name="title" v-model="userInputSubmissionTitle" />
          <!--media options: text, article, image, video-->
          <label for="media">Media</label>
          <div class="flex flex-row">
            <input type="radio" id="text" name="media" value="text" class="m-2" v-model="selectedMedia" />
            <label for="text">Text</label>
            <input type="radio" id="article" name="media" value="article" class="m-2" v-model="selectedMedia" />
            <label for="article">Article</label>
            <input type="radio" id="image" name="media" value="image" class="m-2" v-model="selectedMedia" />
            <label for="image">Image</label>
            <input type="radio" id="video" name="media" value="video" class="m-2" v-model="selectedMedia" />
            <label for="video">Video</label>
          </div>
        </div>
      </div>
      <div v-for="submission in pendingSubmissions" :key="submission.timestamp" class="col-span-1">
        <PostListItem :post="submission" @openSubmissionModal="openSubmissionModal"
          @updatePendingStatus="submission.pending = false" @solidifySubmission="solidifySubmission" />
      </div>

      <div v-for="submission in submissionsSortedByTimestamp" :key="submission._id" class="col-span-1">
        <PostListItem :post="submission" @openSubmissionModal="openSubmissionModal"
          @updatePendingStatus="submission.pending = false" />
      </div>
      <div v-if="lazyLoadingVisible" class="flex justify-center">
        <button @click="loadMoreSubmissions" ref="loadMoreButton"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-b-2xl dark:bg-gray-900">
          Load More
        </button>
      </div>
    </div>
    <SubredditInfoBar v-if="subreddit" :subreddit="subreddit" class="hidden md:block w-1/5" />
  </div>
  <div v-else>Loading...{{ currentSubreddit }}</div>
</template>

<style scoped></style>
