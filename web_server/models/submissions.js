const { connect, ObjectId } = require('./mongo');
const COLLECTION_NAME = 'submissions';

async function collection() {
  const db = await connect();
  return db.collection(COLLECTION_NAME);
}

async function getAll(subreddit_id, page = 1, pageSize = 30) {
  const col = await collection();
  const subreddit = await col.find({ subreddit_id }).skip((page-1) * pageSize).limit(pageSize).toArray();
  const total = await col.countDocuments();
  return { subreddit, total };
}

async function add(subreddit_id, submission) {
  const col = await collection();
  return await col.insertOne({ subreddit_id, submission });
}

module.exports = {
  getAll,
};