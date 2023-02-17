const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
require("dotenv").config();

var app = express();
app.use(cors());

app.use(bodyParser.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@eduvibe.qohjb1g.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const sendEmail = (contactInfo) => {};
async function run() {
  try {
    const courseCollection = client.db("eduVibe").collection("courses");
    const entrolledCourse = client.db("eduVibe").collection("entrolled");
    const instructorCollection = client.db("eduVibe").collection("instructor");
    const adminCollection = client.db("eduVibe").collection("admins");

    app.get("/coures", (req, res) => {
      courseCollection.find({}).toArray((err, courses) => {
        res.send(courses);
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
    app.post("/entrollCourse", async (req, res) => {
      const data = req.body;

      const query = {
        id: data.id,
        email: data.email,
      };
      const alreadyEnrolled = await entrolledCourse.find(query).toArray();

      if (alreadyEnrolled.length) {
        const message = `You Already Enrolled for This Course`;
        return res.send({ message, acknowledged: false });
      }
      const result = await entrolledCourse.insertOne(data);
      res.send(result);
    });
    app.get("/courses", async (req, res) => {
      const filter = req.query.email;
      const isAdmin = await adminCollection.find({ email: filter }).toArray();

      if (isAdmin) {
        const document = await entrolledCourse.find({}).toArray();
        res.send(document);
      } else {
        const document = await entrolledCourse
          .find({ email: filter })
          .toArray();
        res.send(document);
      }
    });
    app.get("/findCourse", async (req, res) => {
      const filter = req.query.id;
      console.log(filter);
      const userDetailes = await entrolledCourse.find({
        _id: ObjectId(filter),
      });

      res.send(userDetailes);
    });

    app.get("/isAdmin", (req, res) => {
      const userEmail = req.query.email;

      adminCollection.find({ email: userEmail }).toArray((err, document) => {
        res.send(document);
      });
    });
    app.post("/addInstructor", async (req, res) => {
      const instructor = req.body;
      const result = await instructorCollection.insertOne(instructor);
      res.send(result.acknowledged);
    });
    app.post("/contact", (req, res) => {
      const { name, email, subject, comment } = req.body;

      const auth = {
        auth: {
          api_key: process.env.api,
          domain: process.env.domain,
        },
      };

      const transporter = nodemailer.createTransport(mg(auth));

      // let transporter = nodemailer.createTransport({
      //     host: 'smtp.sendgrid.net',
      //     port: 587,
      //     auth: {
      //         user: "apikey",
      //         pass: process.env.SENDGRID_API_KEY
      //     }
      // });

      transporter.sendMail(
        {
          from: email, // verified sender email
          to: "akibbhh@gmail.com", // recipient email
          subject: `${name} send you a email from EduVibe`, // Subject line
          text: "Hello world!", // plain text body
          html: `
          <h3>About:${subject}</h3>
          <div>
              <p>></p>
              <p>Message:${comment}</p>
              
          </div>
    
          `, // html body
        },
        (error, info) => {
          if (error) {
            console.log("Email send error", error);
          } else {
            console.log("Email sent: " + info);
            res.send(info);
          }
        }
      );
    });

    app.get("/deletecourse", (req, res) => {
      const id = req.query.courseId;
      entrolledCourse.deleteOne({ _id: ObjectId(id) }).then((result) => {
        res.send(result);
      });
    });
    app.get();
  } finally {
  }
}
run().catch(console.log);

app.get("/", (req, res) => {
  res.send("EduVibe Server");
});

app.listen(process.env.PORT || 5000);
