const { MongoClient } = require("mongodb");

let client;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    if (!client) {
      client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
    }

    const db = client.db("sharebloom");
    const collection = db.collection("messages");

    const data = JSON.parse(event.body);
    await collection.insertOne(data);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
