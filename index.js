const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { MongoClient } = require("mongodb");
const port = process.env.PORT || 5000;


///// MIDDLEWARE ////
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ttyfb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});



async function run() {
  try {
    await client.connect();

    const database = client.db("BIKE_SALES");
    const productsCollection = database.collection("products");
    const usersCollection = database.collection("users");

     //// GET PRODUCTS API ///
     app.get("/products", async (req, res) => {
        const cursor = productsCollection.find({});
        const page = req.query.page;
        const size = parseInt(req.query.size);
        let products;
        if (page) {
          products = await cursor.limit(size).toArray();
        } else {
          products = await cursor.toArray();
        }
        const count = await cursor.count();
        res.send({
          count,
          products,
        });
      });
  
      /// POST PRODUCTS API ///
      app.post("/products", async (req, res) => {
        const products = req.body;
        const result = await productsCollection.insertOne(products);
        res.json(result);
      });
  
   
      //// POST USERS API ///
      app.post("/users", async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        console.log(result);
        res.json(result);
      });
  
      ///// PUT USERS API ///
      app.put("/users", async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await usersCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.json(result);
      });
  
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("BIKE_SALES 5000");
});

app.listen(port, () => {
  console.log("Good Server", port);
});
