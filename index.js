const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mxwvm.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express()


app.use(bodyParser.json());

app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))

app.use(cors());
app.use(express.static('service'));
app.use(fileUpload());


const port = 5000;



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
const orderCollection = client.db("creativeAgency").collection("allOrder");
const admins = client.db("creativeAgency").collection("admins");
const serviceCollection = client.db("creativeAgency").collection("allServices");
const userReview = client.db("creativeAgency").collection("userReview");

  app.post('/makeorder', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const service = req.body.service;
    const serviceDetails = req.body.serviceDetails;
    const price = req.body.price;
    const status = req.body.status;

    const newImg = file.data;
    const encImg = newImg.toString('base64');

      var image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
      };
      orderCollection.insertOne({clientName: name, clientEmail: email, clientWork: service, projectDetails: serviceDetails, price: price, status: status, img: image})
      .then(result => {
          res.send(result)
      })
    
  })

  app.get('/allService', (req, res) => {
    orderCollection.find({})
    .toArray((err, documents) => {
      res.send(documents);
    })
  })

  app.get('/service/:email', (req, res) => {
    orderCollection.find({clientEmail: req.params.email})
    .toArray((err, documents) => {
      res.send(documents);
    })
  })

  app.post('/makeAdmin', (req, res) => {
    const data = req.body;
    admins.insertOne(data)
    .then(result => {
      console.log(result);
    })
  })

  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
      const newImg = file.data;
      const encImg = newImg.toString('base64');

      var image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
      };
      serviceCollection.insertOne({title: title, description: description, img: image})
      .then(result => {
          res.send(result);
      })
  })

  app.post('/userReview', (req, res) => {
    const data = req.body;
    userReview.insertOne(data)
    .then((result) => {
      console.log(result);
    })
  })

  app.get('/allReview', (req, res) => {
    userReview.find({})
    .toArray((err, documents) => {
      res.send(documents);
    })
  })

  app.get('/allServiceList', (req, res) => {
    serviceCollection.find({})
    .toArray((err, documents) => {
      res.send(documents);
    })
  })

  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    admins.find({email: email})
    .toArray((err, admin) => {
      res.send(admin.length > 0);
    })
  })

});


app.listen(process.env.PORT || port)