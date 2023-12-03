import * as myFetch from './myFetch';
import type { DataEnvelope, DataListEnvelope } from './myFetch';

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

export function queueSubmission(submission: SubmissionsItemPending): Promise<SubmissionsItemStatus> {
  return myFetch.api('queue/addSubmission', submission);
}

export function getQueueStatus(queueId: string): Promise<SubmissionsItemStatus> {
  return myFetch.api(`queue/getSubmission?queueId=${queueId}`);
}
