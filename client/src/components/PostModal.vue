<script setup lang="ts">
import type { SubmissionsItem, pendingComment } from '@/model/subreddit'
import { addToEndOfCommentPath, getCommentPathsBySubmissionId, type Comment, type CommentPath } from '@/model/subreddit'
import { onMounted, ref } from 'vue'
import {
  type CommentPathPending,
  type CommentPathStatus,
  queueCommentPath,
  getQueueCommentPathStatus
} from '@/model/queueInference'
import type { DataEnvelope, DataListEnvelope } from '@/model/myFetch'
import { getSession } from '../model/session';

const session = getSession()
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
const userCommentsTexts = ref({} as { [key: string]: string })

const SubmitRootComment = () => {
  if (!session.user)
    return
  const text = userCommentsTexts.value['root']
  userCommentsTexts.value['root'] = ''
  console.log('SubmitRootComment', text)
  const comment = {
    user: session.user!.username,
    userId: session.user!._id.toString(),
    text: text,
    formatted: `${session.user.username} - ${text}`,
    commentPathId: 'root',
    submissionId: post.value._id.toString(),
  } as pendingComment
  console.log('comment', comment)
  
  addToEndOfCommentPath(comment.commentPathId, comment.submissionId, comment).then((envelope: DataEnvelope<CommentPath>) => {
    console.log('commentPath', envelope.data)
    getCommentPathsBySubmissionId(String(post.value._id)).then(
      (envelope: DataListEnvelope<CommentPath>) => {
        console.log('commentPaths', envelope.data)
        completedPaths.value = envelope.data
      }
    )
  })
}

const SubmitComment = (commentPath: CommentPath) => {
  
  if (!session.user)
    return
  const text = userCommentsTexts.value[commentPath._id]
  userCommentsTexts.value[commentPath._id] = ''
  console.log('SubmitComment', commentPath, text)
  const comment = {
    user: session.user!.username,
    userId: session.user!._id.toString(),
    text: text,
    formatted: `${session.user.username} - ${text}`,
    commentPathId: commentPath._id,
    submissionId: post.value._id.toString(),
  } as pendingComment
  console.log('comment', comment)
  
  addToEndOfCommentPath(comment.commentPathId, comment.submissionId, comment).then((envelope: DataEnvelope<CommentPath>) => {
    //console.log('commentPath', envelope.data)
    getCommentPathsBySubmissionId(String(post.value._id)).then(
      (envelope: DataListEnvelope<CommentPath>) => {
        console.log('commentPaths', envelope.data)
        completedPaths.value = envelope.data
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
        <img v-if="post.image" :src="'data:image/png;base64,'+post.image"  />
        <p v-else>{{ post.text }}</p>
      </div>
      <div>
        <!-- Generate Comment Button -->
        <button @click="generateComment" class="bg-reddit-blue text-white rounded-lg px-4 py-2 m-2">
          Randomly Generate Comment Path
        </button>
        <!-- write root comment -->
        <div v-if="session.user" class="rounded-lg p-6">
          <h2>Write Root Comment</h2>
          <input @keyup.enter="SubmitRootComment()" v-model="userCommentsTexts['root']" type="text" class="border-2 border-gray-300 p-1 rounded-lg w-full" />
        </div>
        <div v-else class="rounded-lg p-6">
          <h2>Log in to write a comment</h2>
        </div>
        <div class="comments rounded-lg" v-for="commentPath in completedPaths" :key="commentPath._id">
          <div v-for="(comment, index) in commentPath.commentPath" :key="comment._id">
            <div class="comment" :style="{ marginLeft: `${Number(index) * 20}px` }">
              <h1>{{ comment.user }}</h1>
              <p>{{ comment.text }}</p>
            </div>
          </div>
          <!--write comment-->
          <div v-if="session.user" class="rounded-lg p-6"
            :style="{ marginLeft: `${Number(commentPath.commentPath.length) * 20}px` }">
            <h2>Write Comment</h2>
            <input @keyup.enter="SubmitComment(commentPath)" v-model="userCommentsTexts[commentPath._id]" type="text"
              class="border-2 border-gray-300 p-1 rounded-lg w-2/6" />
          </div>
          <div v-else class="rounded-lg p-6"
            :style="{ marginLeft: `${Number(commentPath.commentPath.length) * 20}px` }">
            <h2>Log in to write a comment</h2>
          </div>
        </div>
        <!-- pendingPathsStatus -->
        <div v-for="commentPathStatus in pendingPathsStatus" :key="commentPathStatus.queueId">
          <div class="flex align-middle justify-center mb-3 mt-5">
            <h2>Generating comment path of {{ commentPathStatus.numberOfComments }} comments... queue:{{
              commentPathStatus.queueIndex }}/{{
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
