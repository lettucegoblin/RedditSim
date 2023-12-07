/**
 * @typedef {Object} Subreddit
 * @property {string} display_name
 * @property {string} _id
 * @property {number} subscribers
 * @property {number} active_users
 * @property {number} accounts_active
 * @property {boolean} over18
 * @property {string} description
 * @property {string} public_description
 * @property {number} created_utc
 */

// Minimum subreddit is display_name and _id

const { randomInt } = require('crypto');
const { connect, ObjectId } = require('./mongo');
const Submissions = require('./submissions');
const Comments = require('./comments');

const COLLECTION_NAME = 'subreddits';

async function collection() {
  const db = await connect();
  return db.collection(COLLECTION_NAME);
}

async function getAll(page = 1, pageSize = 30) {
  const col = await collection();
  const items = await col.find().sort({ subscribers: -1 }).skip((page-1) * pageSize).limit(pageSize).toArray();
  const total = await col.countDocuments();
  return { items, total };
}

async function getById(id) {
  const col = await collection();
  return await col.findOne({ _id: ObjectId(id) });
}

// get by display_name
async function getByDisplayName(display_name) {
  const col = await collection();
  return await col.findOne({ display_name });
}
// create by display_name
async function createSubreddit(display_name, path_name, subscribers) {
  const col = await collection();
  return await col.insertOne({ display_name, path_name, subscribers });
}

// delete all(for testing)
async function deleteAll() {
  const col = await collection();
  return await col.deleteMany({});
}

// Submissions
async function deleteAllSubmissions() {
  return await Submissions.deleteAll();
}

async function getSubmissionById(submissionId) {
  return await Submissions.get(submissionId);
}

// get all submissions of all subreddits
async function getAllSubmissions(page = 1, pageSize = 30) {
  return Submissions.getAll(page, pageSize);
}

// get all submissions of a subreddit pagification
async function getAllSubmissionsOfSubreddit(display_name, page = 1, pageSize = 30) {
  const col = await collection();
  const subreddit = await col.findOne({ display_name });
  const subreddit_id = subreddit._id;
  return await Submissions.getAllBySubredditId(subreddit_id, page, pageSize);
}
// add a submission to a subreddit 
async function addSubmission(display_name, submission) {
  const col = await collection();
  let subreddit = await col.findOne({ display_name });
  let subreddit_id = -1
  if (!subreddit) {
     subreddit = await createSubreddit(display_name, "/r/" + display_name, randomInt(0,1000000));
     subreddit_id = subreddit.insertedId;
  }
  else {
    subreddit_id = subreddit._id;
  }
  
  return await Submissions.add(subreddit_id, submission);
} 

// add a commentPath to a submission
async function addCommentPath(submissionId, commentPath, inferencedCommentPath) {
  commentPath.submissionId = submissionId;
  return await Comments.insertCommentPath(commentPath, inferencedCommentPath);
}

//addToEndOfCommentPath
async function addToEndOfCommentPath(submissionId, commentPathId, commentText, userId, username) {
  return await Comments.addToEndOfCommentPath(submissionId, commentPathId, commentText, userId, username);
}

async function getCommentPath(submissionId, commentPathId) {
  return await Comments.getCommentPath(submissionId, commentPathId);
}
//getCommentPathsRoots
async function getCommentPathsRoots(submissionId) {
  return await Comments.getCommentPathsRoots(submissionId);
}

module.exports = {
  getAll,
  getById,
  getByDisplayName,
  createSubreddit,
  deleteAll,
  getAllSubmissions,
  addSubmission,
  getAllSubmissionsOfSubreddit,
  deleteAllSubmissions,
  getSubmissionById,
  addCommentPath,
  getCommentPath,
  getCommentPathsRoots,
  addToEndOfCommentPath,
};