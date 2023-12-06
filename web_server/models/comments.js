const { connect, ObjectId } = require("./mongo");

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
  const col = await collection("comments");
  // change submissionId to ObjectId
  // check if submissionId is a string
  if (typeof comment.submissionId === "string")
    comment.submissionId = ObjectId(comment.submissionId);
  // change userId to ObjectId
  if (comment.userId) {
    if (typeof comment.userId === "string")
      comment.userId = ObjectId(comment.userId);
  }
  const filter = { _id: comment._id };
  return await col.updateOne(filter, { $set: comment }, { upsert: true });
}

// getCommentPath
async function getCommentPath(submissionId) {
  const col = await collection("commentPaths");
  // change submissionId to ObjectId
  if (typeof submissionId === "string") submissionId = ObjectId(submissionId);
  const commentPath = await col.findOne({ submissionId });
  return commentPath;
}


async function insertCommentPath(commentPathObj, inferencedCommentPath) {
  const col = await collection("commentPaths");
  // change submissionId to ObjectId
  commentPathObj.submissionId = new ObjectId(commentPathObj.submissionId);
  if (!commentPathObj._id) {
    commentPathObj._id = new ObjectId();
  }
  if(!commentPathObj.commentPath) {
    commentPathObj.commentPath = [];
  }
  path = [];
  for (let i = 0; i < commentPathObj.commentPath.length; i++) {
    commentPathObj.commentPath[i]._id = new ObjectId(
      commentPathObj.commentPath[i]._id
    );
    path.push(commentPathObj.commentPath[i]._id);
  }
  // for each in inferencedCommentPath
  for (let i = 0; i < inferencedCommentPath.length; i++) {
    inferencedCommentPath[i].submissionId = commentPathObj.submissionId;
    inferencedCommentPath[i]._id = new ObjectId();
    insertComment(inferencedCommentPath[i]);
    commentPathObj.commentPath.push(inferencedCommentPath[i]);
    path.push(inferencedCommentPath[i]._id );
  }

  
  const commentPath = {
    _id: commentPathObj._id,
    submissionId: commentPathObj.submissionId,
    path: path,
  };

  const filter = { _id: commentPath._id };
  await col.updateOne(filter, { $set: commentPath }, { upsert: true });
  return commentPathObj
}

module.exports = {
  insertComment,
  insertCommentPath,
};
