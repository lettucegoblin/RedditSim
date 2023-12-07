<script setup lang="ts">
import type { SubmissionsItem } from '@/model/subreddit'
import { getCommentPathsBySubmissionId, type Comment, type CommentPath } from '@/model/subreddit'
import { onMounted, ref } from 'vue'
import {
  type CommentPathPending,
  type CommentPathStatus,
  queueCommentPath,
  getQueueCommentPathStatus
} from '@/model/queueInference'
import type { DataListEnvelope } from '@/model/myFetch'

const props = defineProps({
  post: {
    type: Object as () => SubmissionsItem,
    required: true
  }
})

const post = ref(props.post)
const emit = defineEmits(['hideSubmissionModal'])

onMounted(() => {
  console.log('onMounted')
  if (post.value._id === undefined) {
    throw new Error('post.value._id is undefined')
  }
  getCommentPathsBySubmissionId(String(post.value._id)).then(
    (envelope: DataListEnvelope<CommentPath>) => {
      console.log('commentPaths', envelope.data)
      completedPaths.value.push(...envelope.data)
    }
  )
})
const hideSubmissionModal = () => {
  console.log('hideSubmissionModal')
  emit('hideSubmissionModal')
}

//const pendingPaths = ref([] as CommentPathPending[])
const pendingPathsStatus = ref([] as CommentPathStatus[])
const completedPaths = ref([] as CommentPath[])

const generateComment = () => {
  console.log('generateComment', post.value)

  const commentPath = {
    commentPath: [],
    postObj: { ...post.value, image: undefined },
    numberOfComments: Math.floor(Math.random() * 4) + 1 // 1-4
    //nextUser: 'lettuce'
  } as CommentPathPending
  //pendingPaths.value.push(commentPath)
  queueCommentPath(commentPath).then((commentPathStatus: CommentPathStatus) => {
    console.log('commentPathStatus', commentPathStatus)
    pendingPathsStatus.value.push(commentPathStatus)

    setTimeout(updateCommentPathStatus, 1000)
  })
}

const updateCommentPathStatus = () => {
  console.log('updateCommentPathStatus')
  pendingPathsStatus.value.forEach((commentPathStatus: any) => {
    getQueueCommentPathStatus(commentPathStatus.queueId).then(
      (commentPathStatus: CommentPathStatus) => {
        console.log('commentPathStatus', commentPathStatus)
        if (commentPathStatus.message === 'done') {
          pendingPathsStatus.value = pendingPathsStatus.value.filter(
            (commentPathStatus: CommentPathStatus) => commentPathStatus.queueId !== commentPathStatus.queueId
          )
          getCommentPathsBySubmissionId(String(post.value._id)).then(
            (envelope: DataListEnvelope<CommentPath>) => {
              console.log('commentPaths', envelope.data)
              completedPaths.value = envelope.data
            }
          )
        } else setTimeout(updateCommentPathStatus, 1000)
      }
    )
  })
}
</script>

<template>
  <div id="SubmissionModalWrapper" class="absolute top-0 left-0 w-full h-full flex items-center justify-center">
    <div id="hideSubmissionModal"
      class="rounded-xl bg-gray-100 dark:bg-reddit-neutral-background-dark fixed z-50 w-11/12 overflow-y-scroll h-5/6">
      <div class="rounded-lg p-6">
        <h2>{{ post.title }}</h2>
        <p>{{ post.author }}</p>
        <p>{{ post.text }}</p>
      </div>
      <div>
        <!-- Generate Comment Button -->
        <button @click="generateComment" class="bg-reddit-blue text-white rounded-lg px-4 py-2 m-2">
          Generate Comment Path
        </button>
        <div class="comments rounded-lg" v-for="commentPath in completedPaths" :key="commentPath._id">
          <div v-for="(comment, index) in commentPath.commentPath" :key="comment._id">
            <div class="comment" :style="{ marginLeft: `${Number(index) * 20}px` }">
              <h1>{{ comment.user }}</h1>
              <p>{{ comment.text }}</p>
            </div>
          </div>
        </div>
        <!-- pendingPathsStatus -->
        <div v-for="commentPathStatus in pendingPathsStatus" :key="commentPathStatus.queueId">
          <div class="flex align-middle justify-center mb-3 mt-5">
            <h2>Generating comment path of {{ commentPathStatus.numberOfComments }} comments... queue:{{ commentPathStatus.queueIndex }}/{{
              commentPathStatus.queueLength }}</h2>
            <div class="grayscale dot-bricks ml-5 "></div>
          </div>
        </div>
      </div>
    </div>
    <div id="hideSubmissionModal_blackout" @click="hideSubmissionModal" class="fixed inset-0 bg-black opacity-25"></div>
  </div>
</template>

<style scoped></style>
