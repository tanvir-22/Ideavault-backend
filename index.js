const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const cors = require("cors");
require("dotenv").config();
app.use(express.json());
app.use(cors());
const port = process.env.PORT;
const uri = process.env.URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );

    const database = client.db("Ideavault");
    const posts = database.collection("posts");
    const users = database.collection("user");

    //retrieve all posts
    app.get("/posts", async (req, res) => {
      const allPostData = await posts.find({}).toArray();
      res.send(allPostData);
    });

    //retrieve a single post
    app.get("/ideas/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const requiredDocument = await posts.findOne(query);
      res.send(requiredDocument);
    });

    app.get("/users/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const user = await users.findOne(query);
      res.send(user);
    });

    //create a post
    app.post("/createpost", async (req, res) => {
      const postData = req.body;
      postData.author = new ObjectId(postData.author);
      if (typeof postData.tags === "string") {
        postData.tags = postData.tags.split(",").map((t) => t.trim());
      }
      if (typeof postData.estimatedBudget != "Number") {
        postData.estimatedBudget = Number(postData.estimatedBudget);
      }
      postData.createdAt = new Date();
      postData.updatedAt = new Date();
      const result = await posts.insertOne(postData);
      res.send(result);
      console.log("new idea inserted to collection");
    });

    //find usershared posts only

    app.get("/userideas/:id", async (req, res) => {
      const { id } = req.params;
      const query = { author: new ObjectId(id) };
      const result = await posts.find(query).toArray();
      res.send(result);
    });

    //update a post
    app.patch("/update/:id", async (req, res) => {
      const updatedData = req.body;
      const { id } = req.params;
      updatedData.updatedAt = new Date();
      if (typeof updatedData.tags === "string") {
        updatedData.tags = updatedData.tags.split(",").map((t) => t.trim());
      }
      if (typeof updatedData.estimatedBudget != "Number") {
        updatedData.estimatedBudget = Number(updatedData.estimatedBudget);
      }
      const query = { _id: new ObjectId(id) };
      const result = await posts.updateOne(query, { $set: updatedData });
      res.send(result);
      console.log("idea updated successfully");
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
