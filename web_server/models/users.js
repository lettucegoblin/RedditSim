const { connect, ObjectId } = require("./mongo");
const COLLECTION_NAME = "users";

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

async function collection() {
  const db = await connect();
  return db.collection(COLLECTION_NAME);
}

async function login(username, passcode) {
  const col = await collection();
  let user = await col.findOne({ username, passcode });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.passcode !== passcode) {
    throw new Error("Wrong passcode");
  }

  user = { ...user, passcode: undefined };
  const token = await generateJWT(user);
  return { user, token };
}

async function register(username, passcode) {
  const col = await collection();
  let user = await col.findOne({ username, passcode });

  if (user) {
    throw new Error("User already exists");
  }

  if(passcode < 4) {
    throw new Error('Password must be at least 4 characters');
  }
  return await col.insertOne({ username, passcode, createdAt: Date.now() });;
}
function generateJWT(user) {
  return new Promise((resolve, reject) => {
    jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } , (err, token) => {
      if(err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  })
}

function verifyJWT(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if(err) {
        reject(err);
      } else {
        resolve(user);
      }
    });
  })
}

// get user
async function get(userId) {
  const col = await collection();
  return await col.findOne({ _id: ObjectId(userId) });
}

// add user
async function add(user) {
  const col = await collection();
  const doc = await col.insertOne(user);
  return doc;
}

module.exports = {
  get,
  add,
  login,
  register,
  verifyJWT,
  generateJWT
};
