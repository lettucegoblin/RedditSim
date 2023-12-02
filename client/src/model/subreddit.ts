import * as myFetch from './myFetch';
import type { DataEnvelope, DataListEnvelope } from './myFetch';

export interface Subreddit {
  _id: number;
  display_name: string;
  path_name: string;
  path: string;
  subscribers: number;
  online: number;
  posts: SubmissionsItem[];
  rules: { id: number; text: string }[];
  usefulLinks: { id: number; text: string; url: string }[];
  moderators: { id: number; name: string }[];
};

export interface CommentItem {
  id: number
  author: string
  timestamp: number
  content: string
}

export interface SubmissionsItem {
  _id: number
  title: string
  media: string
  author: string
  postPrompt: string
  subreddit: string
  timestamp: number
  text: string
  upvotes: number
  downvotes: number
  comments: CommentItem[]
}
/*
{
        "author": "pikachu_daddy",
        "media": "text",
        "postPrompt": "You are a Reddit post generator.User: Subreddit: /r/AskReddit Author: pikachu_daddy Media: text Title: 1962 Volkswagen Beetle Write the Reddit post.Assistant:",
        "subreddit": "/r/AskReddit",
        "text": " My dad bought this car in 1970 for $500 and he still has it today at age 84. Heu2019s had to replace some parts (like the engine) but everything else is original including the paint job! I think my mom wants him to sell it once he can no longer drive, but I hope not because it would be like selling family history.Edit: Thank you all so much for your kind words! My parents have been married for over 54 years now and they met back when he was working on his first VW Bug. They both love cars and my dad even worked as an auto mechanic before going into teaching. Itu2019s really amazing that heu2019s kept this one for so long!",
        "title": "1962 Volkswagen Beetle"
    }
*/
//temp for testing


export function getSubreddits(): Promise<DataListEnvelope<Subreddit>> {
  return myFetch.api('subreddits/all');
}

export function getSubredditByName(name: string): Promise<DataEnvelope<Subreddit>> {
  return myFetch.api(`subreddits/${name}`);
}

export function getSubmissions(subredditName: string): Promise<DataListEnvelope<SubmissionsItem>> {
  return myFetch.api(`subreddits/${subredditName}/submissions`);
}

