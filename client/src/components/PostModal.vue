<script setup lang="ts">
import type { SubmissionsItem } from '@/model/subreddit'
import { ref } from 'vue'
import {
  type Comment,
  type CommentPath,
  type CommentPathPending,
  type CommentPathStatus,
  queueCommentPath,
  getQueueCommentPathStatus
} from '@/model/queueInference'


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
      CommentPath: CommentPathPending
      CommentPathStatus: CommentPathStatus
    }
  ]
  completed: CommentPath[]
}

const commentManager = ref({} as CommentManager)
commentManager.value.pending = [] as any as [
  {
    CommentPath: CommentPathPending
    CommentPathStatus: CommentPathStatus
  }
]
commentManager.value.completed = [] as any as CommentPath[]
const commentPaths = ref([] as CommentPathPending[])
const generateComment = () => {
  console.log('generateComment', post.value)
  const commentPath = {
    commentPath: [],
    postObj: post.value,
    numberOfComments: Math.floor(Math.random() * 4) + 1 // 1-4
    //nextUser: 'lettuce'
  } as CommentPathPending
  commentPaths.value.push(commentPath)
  queueCommentPath(commentPath).then((commentPathStatus: CommentPathStatus) => {
    console.log('commentPathStatus', commentPathStatus)

    commentManager.value.pending.push({
      CommentPath: commentPath,
      CommentPathStatus: commentPathStatus
    })
    setTimeout(updateCommentPathStatus, 1000)
  })
}

const updateCommentPathStatus = () => {
  console.log('updateCommentPathStatus')
  commentManager.value.pending.forEach((commentPathStatus: any) => {
    getQueueCommentPathStatus(commentPathStatus.CommentPathStatus.queueId).then(
      (commentPathStatus: CommentPathStatus) => {
        console.log('commentPathStatus', commentPathStatus)
        if (commentPathStatus.message === 'done') {
          commentManager.value.completed.push(commentPathStatus.commentPath!)
          commentManager.value.pending = commentManager.value.pending.filter(
            (commentPathStatus: any) => {
              return (
                commentPathStatus.CommentPathStatus.id !== commentPathStatus.CommentPathStatus.id
              )
            }
          )
          console.log('done', commentManager.value.completed)
        }
        setTimeout(updateCommentPathStatus, 1000)
      }
    )
  })
}
</script>

<template>
  <div
    id="SubmissionModalWrapper"
    class="absolute top-0 left-0 w-full h-full flex items-center justify-center"
  >
    <div
      id="hideSubmissionModal"
      class="rounded-xl bg-gray-100 dark:bg-reddit-neutral-background-dark fixed z-50 w-11/12 overflow-y-scroll h-5/6"
    >
      <div class="rounded-lg p-6">
        <h2>{{ post.title }}</h2>
        <p>{{ post.author }}</p>
        <p>{{ post.text }}</p>
      </div>
      <div>
        <!-- Generate Comment Button -->
        <button @click="generateComment" class="bg-reddit-blue text-white rounded-lg px-4 py-2 m-2">
          Generate Comment
        </button>
        <!-- Comment Path using commentManager.completed -->
        <div
          class="comments rounded-lg"
          v-for="commentPath in commentManager.completed"
          :key="commentPath._id"
        >
          <div v-for="(comment, commentIndex) in commentPath" :key="comment._id">
            <div class="comment" :style="{ marginLeft: `${Number(commentIndex) * 20}px` }">
              <h1>{{ comment.user }}</h1>
              <p>{{ comment.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      id="hideSubmissionModal_blackout"
      @click="hideSubmissionModal"
      class="fixed inset-0 bg-black opacity-25"
    ></div>
  </div>
</template>

<style scoped></style>
