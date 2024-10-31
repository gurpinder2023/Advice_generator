require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGODB_URI;

const dbName = process.env.DB_NAME;

const usersTableName = process.env.USERS;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Database connected.");
    const db = client.db(dbName);
    
    const usersCollection = db.collection(usersTableName);
    
    return {
      client,
      db,
      usersCollection,
      
    };
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
}

module.exports = { connectToDatabase };
