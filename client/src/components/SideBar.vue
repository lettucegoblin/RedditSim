<script setup lang="ts">
import { computed, ref } from 'vue'
import { getSubreddits, type Subreddit} from '@/model/subreddit'

const subreddits = ref<Subreddit[]>([])

getSubreddits().then((envelopeList) => {
  subreddits.value = envelopeList.data
  console.log(subreddits.value)
})

//const selectedSubreddit = ref(subreddits[0])
</script>

<template>
  <nav class="flex flex-col w-64 border-r reddit-divider-color shadow">
    <div class="flex items-center justify-center h-16 border-b reddit-divider-color">
      <h1 class="text-lg font-bold">Subreddits</h1>
    </div>
    <div class="flex-grow overflow-y-auto">
      <ul class="flex flex-col py-4 space-y-1">
        <li v-for="subreddit in subreddits" :key="subreddit._id">
          <RouterLink
            :to="`/r/${subreddit.display_name}`"
            class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <span class="text-sm font-medium">{{ subreddit.display_name }}</span>
            <span class="ml-auto text-xs font-semibold text-gray-500 dark:text-gray-400"
              >{{ subreddit.subscribers }} subscribers</span
            >
          </RouterLink>
        </li>
        
        
      </ul>
    </div>
  </nav>
</template>
