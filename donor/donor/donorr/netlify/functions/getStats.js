const { MongoClient } = require("mongodb");

let client;

exports.handler = async () => {
  try {
    if (!client) {
      client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
    }

    const db = client.db("sharebloom");
    const count = await db.collection("messages").countDocuments();

    return {
      statusCode: 200,
      body: JSON.stringify({
        totalUsers: count,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: err.message,
    };
  }
};
