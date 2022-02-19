const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const { get } = require('express/lib/response');
const res = require('express/lib/response');
const { query } = require('express');
const port = process.env.PORT || 5000;


// Midel Ware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dzdlp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {

  try {
    await client.connect();
    const database = client.db('apple_user');
    const serviceCollection = database.collection('service');
    const bookingCollection = database.collection('booking');
    const userCollection = database.collection('users')
    const reviewCollection = database.collection('review')

    //Get Api
    app.get('/services', async (req, res) => {
      const cursor = serviceCollection.find({});
      const service = await cursor.toArray();
      res.send(service);
    })
     
    // Get Api order data filter by email Booking Get 

    app.get('/order', async (req, res) => {
      const email = req.query.email;
      const query = { email : email}
      const cursor = bookingCollection.find(query);
      const order = await cursor.toArray();
      res.send(order);
    })

    // Get Booking All Booking Collection .

    app.get('/booking', async (req, res) => {
      const cursor = bookingCollection.find({})
      const service = await cursor.toArray();
      res.send(service);

    })
    // Get singel booking

    app.get('/booking/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await bookingCollection.findOne(query);
      res.json(service);
    })

    // Get Api review Section

    app.get('/userReview', async (req, res) => {
      const cursor = reviewCollection.find({});
      const order = await cursor.toArray();
      res.send(order);
    })


    //Get Api single service .
    app.get('/services/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.json(service);
    })

    // Get Single user review from database

    // app.get('/userReview/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: ObjectId(id) };
    //   const review = await reviewCollection.findOne(query)
    //   res.json(review);
    // })


    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const user = await userCollection.findOne(query);
      let  isAdmin = false;
      if (user?.role === 'admin') {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    })



    // Post Api  All Data Send To Database.
    app.post('/services', async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service)
      console.log(result);
      res.send(result);
    })

    // Booking Post DataBase 
    app.post('/booking', async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking)
      console.log(result);
      res.send(result);
    })

    // Users Data Post Database 
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user)
      res.send(result);
      // console.log(result);
    })

    // Review Section post Database Send

    app.post('/user-review', async (req, res) => {
      const user = req.body;
      const result = await reviewCollection.insertOne(user)
      res.send(result);
    })

    // Delete Api

    app.delete('/booking/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id)};
      const result = await bookingCollection.deleteOne(query);
      res.json(result);
    })
    


    // Update  Document 
    // Upsart Google Authonticator  ( Post and Get method  middle ware )

    app.put('/users', async (req, res) => {

      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    // Users Admin UPdate
    
    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = {
        $set :{role:'admin'}
      }
      const result = await userCollection.updateOne(filter, updateDoc);
      res.json(result);
    })





  }


  finally {
    // await client.close();
  }


}run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Server is running')
})

app.listen(port, () => {
  console.log(`${port}`)
})