<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import type { PostItem } from '../components/PostListItem.vue';

const PostListItem = defineAsyncComponent(() => import('../components/PostListItem.vue'));

// continue until id 33
const testData: PostItem[] = [
  {
    id: 1,
    title: 'First post',
    author: 'Alice',
    timestamp: Date.now(),
    content: 'This is my first post!',
    upvotes: 10,
    downvotes: 2,
    comments: [
      {
        id: 1,
        author: 'Bob',
        timestamp: Date.now(),
        content: 'Great post!'
      },
      {
        id: 2,
        author: 'Charlie',
        timestamp: Date.now(),
        content: 'I agree!'
      }
    ]
  },
  {
    id: 2,
    title: 'Second post',
    author: 'Bob',
    timestamp: Date.now(),
    content: 'This is my second post!',
    upvotes: 5,
    downvotes: 1,
    comments: [
      {
        id: 1,
        author: 'Alice',
        timestamp: Date.now(),
        content: 'Nice post!'
      }
    ]
  }, {
    id: 3,
    title: 'Third post',
    author: 'Charlie',
    timestamp: Date.now() - 1000,
    content: 'This is my third post!',
    upvotes: 3,
    downvotes: 0,
    comments: []
  },
  {
    id: 4,
    title: 'Fourth post',
    author: 'Eve',
    timestamp: Date.now() + 1000,
    content: 'This is my fourth post!',
    upvotes: 7,
    downvotes: 2,
    comments: [
      {
        id: 1,
        author: 'Bob',
        timestamp: Date.now() - 1000,
        content: 'Interesting post!'
      },
      {
        id: 2,
        author: 'Charlie',
        timestamp: Date.now(),
        content: 'Good job!'
      }
    ]
  }, {
    id: 5,
    title: 'Fifth post',
    author: 'Dave',
    timestamp: Date.now() - 2000,
    content: 'This is my fifth post!',
    upvotes: 9,
    downvotes: 1,
    comments: [
      {
        id: 1,
        author: 'Eve',
        timestamp: Date.now() - 3000,
        content: 'Keep it up!'
      },
      {
        id: 2,
        author: 'Alice',
        timestamp: Date.now(),
        content: 'Awesome post!'
      }
   ]
  }, {
    id: 6,
    title: 'Sixth post',
    author: 'James',
    timestamp: Date.now() - 3000,
    content: 'This is my sixth post!',
    upvotes: 8,
    downvotes: 1,
    comments: [
      {
        id: 1,
        author: 'Dave',
        timestamp: Date.now() - 4000,
        content: 'Amazing post!'
      },
      {
        id: 2,
        author: 'Eve',
        timestamp: Date.now() - 2000,
        content: 'You did great!'
      }
    ]
  }, {
    id: 7,
    title: 'Seventh post',
    author: 'Michael',
    timestamp: Date.now() - 4000,
    content: 'This is my seventh post!',
    upvotes: 4,
    downvotes: 0,
    comments: []
  }, {
    id: 8,
    title: 'Eighth post',
    author: 'Adam',
    timestamp: Date.now() - 5000,
    content: 'This is my eighth post!',
    upvotes: 6,
    downvotes: 1,
    comments: [
      {
        id: 1,
        author: 'James',
        timestamp: Date.now() - 6000,
        content: 'Well done!'
      },
      {
        id: 2,
        author: 'Michael',
        timestamp: Date.now() - 4000,
        content: 'Great work!'
      }
    ]
  }
];

</script>

<template>
  <main>
    <div v-for="post in testData" :key="post.id">
      <PostListItem :post="post" />
    </div>
  </main>
</template>
