<script setup lang="ts">
import { defineProps, ref } from 'vue'
import { type Subreddit } from '@/model/subreddit'

const props = defineProps({
  subreddit: {
    type: Object as () => Subreddit,
    required: true
  }
})

</script>

<template>
  <div>
    <h2>{{ subreddit.display_name }}</h2>
    <p>{{ subreddit.subscribers }} members</p>
    <p>{{ subreddit.online }} online</p>
    <h3>Rules</h3>
    <ul>
      <li v-for="rule in subreddit.rules" :key="rule.id">{{ rule.text }}</li>
    </ul>
    <h3>Useful Links</h3>
    <ul>
      <li v-for="link in subreddit.usefulLinks" :key="link.id">
        <a :href="link.url">{{ link.text }}</a>
      </li>
    </ul>
    <h3>Moderators</h3>
    <ul>
      <li v-for="moderator in subreddit.moderators" :key="moderator.id">{{ moderator.name }}</li>
    </ul>
  </div>
</template>
