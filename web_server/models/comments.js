const { connect, ObjectId } = require('./mongo');

// collection name is comments or commentPaths

async function collection(COLLECTION_NAME) {
  const db = await connect();
  return db.collection(COLLECTION_NAME);
}

/*
  comments = {
    _id: ObjectId,
    submissionId: ObjectId,
    userId: ObjectId, // only if user is not a bot
    username: String,
    text: String,

  commentPaths = {
    _id: ObjectId,
    submissionId: ObjectId,
    commentPath: [ObjectId],
*/
async function insertComment(comment) {
  const col = await collection('comments');
  // change submissionId to ObjectId
  comment.submissionId = ObjectId(comment.submissionId);
  // change userId to ObjectId
  if (comment.userId) {
    comment.userId = ObjectId(comment.userId);
  }
  const filter = { _id: comment._id };
  return await col.updateOne(filter, { $set: comment }, { upsert: true });
}

async function insertCommentPath(commentPathObj) {
  const col = await collection('commentPaths');
  // change submissionId to ObjectId
  commentPathObj.submissionId = new ObjectId(commentPathObj.submissionId);
  if(!commentPathObj._id){
    commentPathObj._id = new ObjectId();
  }
  path = []
  for(let i = 0; i < commentPathObj.commentPath.length; i++){
    if(commentPathObj.commentPath[i]._id){
      commentPathObj.commentPath[i]._id = new ObjectId(commentPathObj.commentPath[i]._id);
    } else{
      // we need to insert this comment first and get the _id
      commentPathObj.commentPath[i]._id = (await insertComment(commentPathObj.commentPath[i])).upsertedId;
    }
    path.push(commentPathObj.commentPath[i]._id);
  }
  const commentPath = {
    _id: commentPathObj._id,
    submissionId: commentPathObj.submissionId,
    path: path
  };

  const filter = { _id: commentPath._id };
  return await col.updateOne(filter, { $set: commentPath }, { upsert: true });
}

module.exports = {
  insertComment,
  insertCommentPath
};