<script setup lang="ts">
import { computed, ref } from 'vue'
import { getSubreddits, type Subreddit } from '@/model/subreddit'
import Search from './Search.vue';

const subreddits = ref<Subreddit[]>([])
const subredditsDisplayed = ref<Subreddit[]>([])

const updateSubredditList = () => {
  getSubreddits(1, 500).then((envelopeList) => {
    subreddits.value = envelopeList.data
    subredditsDisplayed.value = subreddits.value
    console.log(subreddits.value)
  })
}
updateSubredditList()

const updateSubredditListDelayed = () => {
  setTimeout(updateSubredditList, 5000)
}

const subscriberCountToShorthand = (count: number) => {
  if (count < 1000) {
    return count.toString()
  } else if (count < 1000000) {
    return (count / 1000).toFixed(1) + 'k'
  } else {
    return (count / 1000000).toFixed(1) + 'm'
  }
}
const searchQuery = ref()
const canCreateSubreddit = ref(false)
//updateSubreddits
const searchSubreddits = (_subreddits: Subreddit[], _searchQuery: String) => {
  console.log('searchSubreddits', _subreddits, _searchQuery)
  searchQuery.value = _searchQuery
  subredditsDisplayed.value = _subreddits
  // if index of searchQuery is -1, then canCreateSubreddit = true 
  const searchQueryIsNotAlreadySubreddit = _subreddits.findIndex((_subreddits) => _subreddits.display_name.toLowerCase() == _searchQuery.toLowerCase()) == -1;
  const searchQueryIsValidSubredditName = _searchQuery.length >= 3 && _searchQuery.length <= 21 && _searchQuery.match(/^[a-zA-Z0-9_]*$/)
  if (searchQueryIsNotAlreadySubreddit && searchQueryIsValidSubredditName) {
    canCreateSubreddit.value = true
  } else {
    canCreateSubreddit.value = false
  }
}


//const selectedSubreddit = ref(subreddits[0])
</script>

<template>
  <nav class="flex flex-col w-1/5 border-r reddit-divider-color shadow overflow-y-scroll" style="height:60vh">
    
    <div class="flex items-center justify-center h-16 border-b reddit-divider-color">
      <h1 class="text-lg font-bold">Subreddits</h1>
      
    </div>
    <div class="flex-grow overflow-y-auto">
      <Search searchType="subreddits" v-bind:subreddits="subreddits" @search="searchSubreddits" />
      <ul class="flex flex-col py-4 space-y-1">
        <li v-if="canCreateSubreddit" class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100">
          <RouterLink :click="updateSubredditListDelayed" :to="{ name: 'subreddit', params: { subreddit: searchQuery } }" class="flex items-center">
            <font-awesome-icon icon="plus" class="h-4 w-4" />
            <span class="ml-2 text-sm font-medium">Create /r/{{ searchQuery }}</span>
          </RouterLink>
        </li>
        
        <li v-for="subreddit in subredditsDisplayed" :key="subreddit._id">
          <RouterLink :to="{ name: 'subreddit', params: { subreddit: subreddit.display_name } }"
            class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100">
            <span class="text-sm font-medium">{{ subreddit.display_name }}</span>
            <span class="ml-auto text-xs font-semibold text-gray-500 dark:text-gray-400">{{ subscriberCountToShorthand(subreddit.subscribers) }}
              subscribers</span>
          </RouterLink>
        </li>


      </ul>
    </div>
  </nav>
</template>
