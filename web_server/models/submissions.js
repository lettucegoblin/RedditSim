const { connect, ObjectId } = require('./mongo');
const COLLECTION_NAME = 'submissions';

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

async function getAllBySubredditId(subreddit_id, page = 1, pageSize = 30) {
  const col = await collection();
  const subreddit = await col.find({ subreddit_id }).skip((page-1) * pageSize).limit(pageSize).toArray();
  const total = await col.countDocuments();
  return { subreddit, total };
}

async function add(subreddit_id, submission) {
  const col = await collection();
  return await col.insertOne({ subreddit_id, ...submission });
}

// delete all(for testing)
async function deleteAll() {
  const col = await collection();
  return await col.deleteMany({});
}

module.exports = {
  getAll,
  getAllBySubredditId,
  add,
  deleteAll
};