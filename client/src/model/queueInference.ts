import * as myFetch from './myFetch';
import type { DataEnvelope, DataListEnvelope } from './myFetch';
import type { SubmissionsItem, Comment, CommentPath } from './subreddit';

//submissions item pending
export interface SubmissionsItemPending {
  timestamp: number,
  subreddit?: string,
  author?: string,
  title?: string,
  media?: string,
  status?: string,
  _id?: string,
}
export interface SubmissionsItemStatus {
  message: string;
  queueId: string;
  queueIndex: number;
  queueLength: number;
  postObj: SubmissionsItemPending;
}

//commentPath, postObj, numberOfComments, nextUser
export interface CommentPathPending {
  commentPath: string[];
  postObj: SubmissionsItem;
  numberOfComments: number;
  nextUser?: string;
}


export interface CommentPathStatus {
  message: string;
  queueId?: string;
  queueIndex?: number;
  queueLength?: number;
  postObj: SubmissionsItem;
  commentPath?: CommentPath;
  numberOfComments?: number;
}
/* done
 message: "done",
 postObj: commentPath.postObj,
 commentPath: commentPath.commentPath,
*/
// queueComment
export function queueCommentPath(comment: CommentPathPending): Promise<CommentPathStatus> {
  return myFetch.api('queue/addCommentPath', comment);
}
export function getQueueCommentPathStatus(queueId: string): Promise<CommentPathStatus> {
  return myFetch.api(`queue/getCommentPath?queueId=${queueId}`);
}

export function queueSubmission(submission: SubmissionsItemPending): Promise<SubmissionsItemStatus> {
  return myFetch.api('queue/addSubmission', submission);
}

export function getSubmissionStatus(queueId: string): Promise<SubmissionsItemStatus> {
  return myFetch.api(`queue/getSubmission?queueId=${queueId}`);
}
