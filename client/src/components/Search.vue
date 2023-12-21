<script setup lang="ts">
import { type Subreddit, searchSubsAndPosts } from '@/model/subreddit';
import { ref } from 'vue';


const props = defineProps({
  searchType: {
    type: String,
    required: true
  },
  subreddits: {
    type: Array<Subreddit>,
    required: false
  }
})

const emit = defineEmits(['search'])

const searchQuery = ref('')

const search = () => {
  console.log('search', searchQuery.value)
  if (props.searchType == 'subreddits' && props.subreddits) {
    const filteredSubreddits = props.subreddits.filter((subreddit) => {
      return subreddit.display_name.toLowerCase().includes(searchQuery.value.toLowerCase())
    })
    emit('search', filteredSubreddits, searchQuery.value)
  }
  else if(props.searchType == 'posts') {
    if (searchQuery.value.length < 1) {
      emit('search', [], [], searchQuery.value)
      return
    }
    searchSubsAndPosts(searchQuery.value, 1, 5).then((response) => {
      console.log('searchSubsAndPosts', response.data)
      const { subreddits, submissions } = response.data
      emit('search', subreddits.items, submissions.items, searchQuery.value)
    })
  }
}

console.log('searchType', props.searchType, props.subreddits)
const searchType = ref(props.searchType)
</script>

<template>
  <div class="flex flex-1 items-center justify-center">
    <div class="sm:block w-full max-w-screen-md">
      <div class="flex space-x-4">
        <div class="relative w-full">
          <i class="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400">
            <font-awesome-icon icon="search" class="h-5 w-5" />
          </i>
          <input type="text" class="rounded-3xl h-12 w-full pl-8 pr-3 py-2 text-sm font-medium"
            :placeholder="searchType == 'posts' ? 'Search Reddit' : 'Search Subreddits'" @input="search" v-model="searchQuery" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>