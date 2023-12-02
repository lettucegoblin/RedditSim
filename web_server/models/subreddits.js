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

const { connect, ObjectId } = require('./mongo');
const Submissions = require('./submissions');
const COLLECTION_NAME = 'subreddits';

async function collection() {
  const db = await connect();
  return db.collection(COLLECTION_NAME);
}

async function getAll(page = 1, pageSize = 30) {
  const col = await collection();
  const items = await col.find().skip((page-1) * pageSize).limit(pageSize).toArray();
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

// get all submissions of a subreddit pagification
async function getAllSubmissions(display_name, page = 1, pageSize = 30) {
  const col = await collection();
  const subreddit = await col.findOne({ display_name });
  const subreddit_id = subreddit._id;
  return await Submissions.getAll(subreddit_id, page, pageSize);
}
// add a submission to a subreddit
async function addSubmission(display_name, submission) {
  const col = await collection();
  const subreddit = await col.findOne({ display_name });
  const subreddit_id = subreddit._id;
  return await Submissions.add(subreddit_id, submission);
}

module.exports = {
  getAll,
  getById,
  getByDisplayName,
  createSubreddit,
  deleteAll,
  getAllSubmissions,
  addSubmission,
};