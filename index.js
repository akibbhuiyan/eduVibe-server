const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

require("dotenv").config();

var app = express();
app.use(cors());

app.use(bodyParser.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@eduvibe.qohjb1g.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    {
      const courseCollection = client.db("eduVibe").collection("courses");
      const instructorCollection = client
        .db("eduVibe")
        .collection("instructor");
      app.get("/coures", (req, res) => {
        courseCollection.find({}).toArray((err, document) => {
          res.send(document);
        });
      });
      app.get("/instructors", (req, res) => {
        instructorCollection.find().toArray((err, document) => {
          res.send(document);
        });
      });
      app.get("/instructor", (req, res) => {
        const iname = req.query.name;
        instructorCollection.find({ name: iname }).toArray((err, document) => {
          res.send(document);
        });
      });
    }
  } finally {
  }
}
run().catch(console.log);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(5000);
