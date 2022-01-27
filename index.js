const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middle ware
app.use(cors());
app.use(express.json());

// uri and mongo client
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mas8d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // connect with mongo
    await client.connect();
    const database = client.db("transcrew");
    const serviceCollection = database.collection("services");
    const orderCollection = database.collection("orders");
    // get all services bye GET Method
    app.get("/services", async (req, res) => {
      const cursor = serviceCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });

    // get every single service by POST
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(filter);
      res.send(service);
    });

    // POST services
    app.post("/services", async (req, res) => {
      const newService = req.body;
      const result = await serviceCollection.insertOne(newService);

      res.json(result);
    });

    // Order collection
    // post orders details
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);

      res.send(result);
    });

    // GET Orders
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      let filter = {};
      if (email) {
        filter = { userEmail: email };
      }

      const cursor = orderCollection.find(filter);
      const orders = await cursor.toArray();
      res.send(orders);
    });

    // UPDATE Order status
    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await orderCollection.updateOne(filter, {
        $set: {
          status: "approved",
        },
      });
      res.json(result);
    });

    // DELETE Order
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    // client.close();
  }
}
// call run function
run().catch(console.dir());

// GET request at the root directory
app.get("/", (req, res) => {
  res.send("Transcrew server is running");
  console.log("transcrew server is running");
});

// Hey app listen please
app.listen(port, () => {
  console.log(`Server is running at port : http://localhost:${port}`);
});
