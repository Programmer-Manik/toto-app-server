const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { config } = require("dotenv");

const uri = process.env.DB_URI;

// const uri = `mongodb+srv://todo-app:${process.env.DB_SECRET}@cluster0.7em2cfy.mongodb.net/Todo-App?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

app.use(cors());
app.use(express.json());

//database and routes
const run = async () => {
  try {
    // database name
    const db = client.db("Todo-App");

    //database collection name
    const todoCollection = db.collection("todos");

    // get todo list from todo's collection
    app.get("/todo-list", async (req, res) => {
      let query = {};

      if (req.query.priority) {
        query.priority = req.query.priority;
      }
      const result = await todoCollection.find(query).toArray();

      if (!result.length) {
        return res.status(404).send({ message: "data not found" });
      }
      res.send(result);
    });

    //create todo in todo's collection
    app.post("/create-todo-list", async (req, res) => {
      const body = req.body;
      if (!body) {
        return res.status(404).send({ message: "could not received data" });
      }
      const result = await todoCollection.insertOne(body);
      res.status(200).send({
        success: true,
        data: result,
      });
    });

    //delete todo list from todo's collection
    app.delete("/remove-todo-list/:id", async (req, res) => {
      const id = req.params.id;

      if (!id) {
        return res.status(404).send({ message: "id not found" });
      }

      const result = await todoCollection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).send({ message: "data can't be deleted" });
      }

      res.status(200).send({
        message: "data deleted successfully",
        data: result,
      });
    });

    //* update todo list
    app.put("/update-todo-list/:id", async (req, res) => {
      const id = req.params.id;

      if (!id) {
        return res.status(404).send({ message: "id not found" });
      }

      const body = req.body;
      const updateId = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          title: body.title,
          description: body.description,
          priority: body.priority,
          isCompleted: body?.isCompleted,
        },
      };
      const result = await todoCollection.updateOne(updateId, updateDoc, {
        upsert: true,
      });

      res.status(200).send({ message: "update data successful" });
    });

    //* toggle todo list
    app.put("/toggle-todo-list/:id", async (req, res) => {
      const id = req.params.id;

      if (!id) {
        return res.status(404).send({ message: "id not found" });
      }

      const body = req.body;
      const updateId = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          isCompleted: body?.isCompleted,
        },
      };
      const result = await todoCollection.updateOne(updateId, updateDoc, {
        upsert: true,
      });

      res.status(200).send({ message: "toggle data successful" });
    });

    //
  } finally {
    //
  }
};
run();

// server running api
app.get("/", (req, res) => {
  res.send({
    success: true,
    status: 200,
    server: "Todo-App",
  });
});
app.listen(port, () => {
  console.log(`Welcome to Todo App: from ==> ${port}`);
});
