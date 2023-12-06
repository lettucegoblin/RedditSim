<script setup lang="ts">
import type { SubmissionsItem } from '@/model/subreddit';
import { ref } from 'vue';
import { type CommentPathPending, type CommentPathStatus, queueCommentPath, getQueueCommentPathStatus } from '@/model/queueInference'

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
interface CommentManager {
  pending: [
    {
      CommentPath: CommentPathPending,
      CommentPathStatus: CommentPathStatus
    }
  ],
  completed: CommentPathPending[]
}

const commentManager = ref({} as CommentManager)
const commentPaths = ref([] as CommentPathPending[])
const generateComment = () => {
  console.log('generateComment', post.value)
  const commentPath = {
    commentPath: [],
    postObj: post.value,
    numberOfComments: 1,
    nextUser: 'lettuce'
  } as CommentPathPending
  commentPaths.value.push(commentPath)
  queueCommentPath(commentPath).then((commentPathStatus: CommentPathStatus) => {
    console.log('commentPathStatus', commentPathStatus)
    debugger
    commentManager.value.pending.push({
      CommentPath: commentPath,
      CommentPathStatus: commentPathStatus
    })

  })
}
</script>

<template>
  <div id="SubmissionModalWrapper" class="absolute top-0 left-0 w-full h-full flex items-center justify-center">
    <div id="hideSubmissionModal"
      class="rounded-xl bg-gray-100 dark:bg-reddit-neutral-background-dark fixed z-50 w-11/12 overflow-y-scroll h-5/6">
      <div class=" rounded-lg p-6">
        <h2>{{ post.title }}</h2>
        <p>{{ post.author }}</p>
        <p>{{ post.text }}</p>
      </div>
      <div>
        <!-- Generate Comment Button -->
        <button @click="generateComment" class="bg-reddit-blue text-white rounded-lg px-4 py-2 m-2">Generate
          Comment</button>
        <div class="comments rounded-lg p-6">
          <h2>Comments</h2>
          <div class="comment">
            <p>Comment 1</p>
          </div>
          <div class="comment">
            <p>Comment 2</p>
          </div>
          <div class="comment">
            <p>Comment 3</p>
          </div>
        </div>
      </div>
    </div>
    <div id="hideSubmissionModal_blackout" @click="hideSubmissionModal" class="fixed inset-0 bg-black opacity-25"></div>

  </div>
</template>

<style scoped></style>