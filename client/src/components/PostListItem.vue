<script setup lang="ts">
import { getSubmission, type SubmissionsItem } from '@/model/subreddit';
import { computed, defineProps, ref } from 'vue'
import { type SubmissionsItemPending, queueSubmission, getSubmissionStatus, type SubmissionsItemStatus } from '../model/queueInference';

const props = defineProps({
  post: {
    type: Object as () => SubmissionsItem,
    required: true
  }
})

const emit = defineEmits(['openSubmissionModal', 'updatePendingStatus', 'solidifySubmission'])

const submissionToDisplay = ref(props.post);

const pendingSub = ref({} as SubmissionsItemPending);
const pendingSubStatus = ref({} as SubmissionsItemStatus);
if (props.post.pending) {
  console.log('props.post.pending', props.post);
  const submission = {
    subreddit: props.post.subreddit,
    timestamp: props.post.timestamp,
    media: props.post.media,
    title: props.post.title,
  } as SubmissionsItemPending;
  pendingSub.value = submission;
  
  queueSubmission(submission).then((subStatus: SubmissionsItemStatus) => {
    console.log('subStatus', subStatus);
    pendingSubStatus.value = subStatus;
    probeStatus()
  });
} 

function probeStatus() {
  if (!pendingSubStatus.value.queueId){
    throw new Error('No queueId');
    return
  }
  getSubmissionStatus(pendingSubStatus.value.queueId).then((subStatus: SubmissionsItemStatus) => {
    console.log('subStatus', subStatus);
    pendingSubStatus.value = subStatus;
    pendingSub.value = {...subStatus.postObj};

    if (pendingSubStatus.value.message === 'pending') {
      setTimeout(probeStatus, 1000);
      console.log('pendingSub.value.status', pendingSub.value.status, pendingSubStatus.value.queueId);
    } else if (pendingSubStatus.value.message === 'done') {
      
      console.log("pendingSub.value", pendingSub.value);
      submissionToDisplay.value = {
        ...pendingSub.value,
        pending: false,
      } as unknown as SubmissionsItem;
      emit('updatePendingStatus');
      emit('solidifySubmission', submissionToDisplay.value)
      /*getSubmission(submissionToDisplay.value.subreddit, pendingSub.value._id).then((envelope) => {
        console.log('envelope', envelope);
        submissionToDisplay.value = envelope.data;
      });*/
    } else if (pendingSub.value.status === 'no submission') {
      throw new Error('No submission');
      return
    }
  });
}

function formatDate(timestamp: number): string {
  // Format the date however you like
  return new Date(timestamp).toLocaleDateString()
}
</script>

<template>
  <article v-if="submissionToDisplay.pending"
    class="border-dashed border-2 border-light-blue-500 prose md:prose-lg lg:prose-xl rounded-2xl p-4 mx-8 mb-4 hover:bg-slate-200 dark:hover:bg-reddit-highlight-dark">
    
    <div class="grayscale dot-bricks relative float-right top-3"></div> <!--loading symbol-->
    <h2>
      <div v-if="submissionToDisplay.subreddit"> Generating submission for /r/{{ submissionToDisplay.subreddit }}...</div>
      <div v-else>Random subreddit...</div>
      <div v-if="pendingSubStatus.queueId">
        Queue: {{ pendingSubStatus.queueIndex + 1 }}/{{ pendingSubStatus.queueLength }}
      </div>
    </h2>
    
  </article>
  <article v-else
    @click="emit('openSubmissionModal', submissionToDisplay)"
    id="SubmissionListItem"
    class="max-h-96 prose md:prose-lg lg:prose-xl rounded-2xl p-4 mx-8 mb-4 hover:bg-slate-200 dark:hover:bg-reddit-highlight-dark">
    <h2>/r/{{ submissionToDisplay.subreddit }} by {{ submissionToDisplay.author }} on {{ formatDate(submissionToDisplay.timestamp) }}</h2>
    <h1>{{ submissionToDisplay.title }}</h1>
    <div class="flex-col h-60 w-auto bg-slate-900 flex justify-center items-center" v-if="submissionToDisplay.media == 'image' || submissionToDisplay.media == 'video'">
      <img v-if="submissionToDisplay.image" class="image" :src="'data:image/png;base64,'+submissionToDisplay.image" />
      <div v-else>
        <h1>{{ submissionToDisplay.media }}</h1>
        <p >{{ submissionToDisplay.text }}</p>
      </div>
      
    </div> 
    <p v-else class="post-list-text">{{ submissionToDisplay.text }}</p>
  </article>
</template>

<style scoped>

#SubmissionListItem {
  cursor: pointer !important;
}
.post-list-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image {
  width: auto;
  height: 100%;
}

</style>