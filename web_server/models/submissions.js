const { connect, ObjectId } = require('./mongo');
const COLLECTION_NAME = 'submissions';
const SUBMISSION_SORT = { timestamp: -1 };
async function collection() {
  const db = await connect();
  return db.collection(COLLECTION_NAME);
}
const INFERENCE_SERVER = process.env.INFERENCE_SERVER_URL;
async function seedAllWithImages() { // for testing doesn't work without development server
  console.log("seeding all submissions with images")
  const allSubmissions = await getAll(1,2000);
  const col = await collection();
  // for each submission that has media set to image or video
  for (let submission of allSubmissions.items) {
    if (submission.media === "image" || submission.media === "video") {
      //if(submission.image) continue; // skip if already has image
      // get image from inference server
      const image = await genImage(submission);
      // add image to submission
      await col.updateOne({ _id: submission._id }, { $set: { image } });
    }
  }
  
}
//seedAllWithImages()
async function genImage(postObj) {
  const response = await fetch(`${INFERENCE_SERVER}/generate_image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({
      postObj
    })
  });
  json = await response.json();
  console.log("inference_submission response", json) 
  // return the response
  return json['image']
}

async function getAll(page = 1, pageSize = 30) {
  const col = await collection();
  const items = await col.find().sort(SUBMISSION_SORT).skip((page-1) * pageSize).limit(pageSize).toArray();
  const total = await col.countDocuments(); 
  return { items, total };
}

async function get(id) {
  const col = await collection();
  return await col.findOne({ _id: ObjectId(id) });
}

async function getAllBySubredditId(subreddit_id, page = 1, pageSize = 30) {
  const col = await collection();
  const subreddit = await col.find({ subreddit_id }).sort(SUBMISSION_SORT).skip((page-1) * pageSize).limit(pageSize).toArray();
  const total = await col.countDocuments({ subreddit_id });
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
  deleteAll,
  get
};