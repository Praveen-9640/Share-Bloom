const { MongoClient, ObjectId } = require("mongodb");

let client;

exports.handler = async (event) => {
  try {
    const { id } = JSON.parse(event.body);

    if (!client) {
      client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
    }

    const db = client.db("sharebloom");
    await db.collection("messages").deleteOne({ _id: new ObjectId(id) });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: err.message,
    };
  }
};
