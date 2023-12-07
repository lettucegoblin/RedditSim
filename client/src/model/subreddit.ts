import * as myFetch from './myFetch';
import type { DataEnvelope, DataListEnvelope } from './myFetch';

export interface Subreddit {
  _id: string;
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

export interface pendingComment {
  formatted: string;
  submissionId: string;
  commentPathId: string;
  text: string;
  user: string;
  userId: string;
}

export interface Comment {
  _id: string;
  formatted: string;
  submissionId: string;
  text: string;
  user: string;
}

export interface CommentPath {
  _id: string;
  commentPath: Comment[];
  submissionId: string;
}

export interface SubmissionsItem {
  _id: string
  title: string
  media: string
  author: string
  postPrompt: string
  subreddit: string
  timestamp: number
  text: string
  image?: string
  upvotes: number
  downvotes: number
  comments: Comment[]
  pending: boolean
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

export function getSubmission(subredditName: string, submissionId: string): Promise<DataEnvelope<SubmissionsItem>> {
  return myFetch.api(`subreddits/${subredditName}/submissions/${submissionId}`);
}

export function getCommentPathsBySubmissionId(submissionId: string): Promise<DataListEnvelope<CommentPath>> {
  return myFetch.api(`subreddits/comments/list/${submissionId}`);
}

//addToEndOfCommentPath
export function addToEndOfCommentPath(commentPathId: string, submissionId: string, comment: pendingComment): Promise<DataEnvelope<CommentPath>> {
  return myFetch.api(`subreddits/comments/${submissionId}/${commentPathId}`, comment, 'POST');
}