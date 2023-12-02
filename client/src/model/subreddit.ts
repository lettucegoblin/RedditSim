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
  pending: boolean
}

//submissions item pending
export interface SubmissionsItemPending {
  timestamp: number
}

export function getSubreddits(page: number, pageSize: number): Promise<DataListEnvelope<Subreddit>> {
  return myFetch.api('subreddits/all', { page, pageSize });
}

export function getSubredditByName(name: string): Promise<DataEnvelope<Subreddit>> {
  return myFetch.api(`subreddits/${name}`);
}

export function getSubmissions(subredditName: string, page: number, pageSize: number): Promise<DataListEnvelope<SubmissionsItem>> {
  return myFetch.api(`subreddits/${subredditName}/submissions`, { page, pageSize });
}

