const { MongoClient } = require("mongodb");

let client;

exports.handler = async () => {
  try {
    if (!client) {
      client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
    }

    const db = client.db("sharebloom");
    const users = await db.collection("messages").find({}).toArray();

    return {
      statusCode: 200,
      body: JSON.stringify(users),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: err.message,
    };
  }
};
