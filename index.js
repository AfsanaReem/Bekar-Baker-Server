const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();
app.use(cors());
app.use(express.json());


const uri = "mongodb+srv://bekars_baker:F9REwTq42PYwG2Kz@cluster0.khy11rb.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db("Bekar'sBaker").collection("Menu");
        const reviewCollection = client.db("Bekar'sBaker").collection('reviews');

        app.get('/Menu', async (req, res) => {
            const query = {};
            const sort = { date: -1 };
            const limit = 3;
            const cursor = serviceCollection.find(query).limit(limit).sort(sort);
            const services = await cursor.toArray();
            res.send(services);
        });
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ token })
        })
        app.get('/allservices', async (req, res) => {
            const query = {};
            const sort = { date: -1 };
            const limit = 0;
            const cursor = serviceCollection.find(query).limit(limit).sort(sort);
            const services = await cursor.toArray();
            res.send(services);
        });


        app.get('/reviews', async (req, res) => {
            let query = {};
            const sort = { date: -1 };
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query).sort(sort);
            const reviews = await (await cursor.toArray());
            res.send(reviews);
        });

        app.get('/servicereviews', async (req, res) => {
            const query = {
                service_id: req.query.service_id
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const review = await reviewCollection.findOne(query);
            res.send(review);
        });
        app.put('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const review = req.body;
            const option = { upsert: true };
            const updateReview = {
                $set: {
                    review: review.review
                }
            }
            const result = await reviewCollection.updateOne(filter, updateReview, option)
            res.send(result);
        });

        app.post('/services', async (req, res) => {
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            res.send(result);
        })

        app.post('/reviews', async (req, res) => {
            const newReview = req.body;
            const result = await reviewCollection.insertOne(newReview);
            res.send(result);
        })

        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })


    }
    finally {

    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () => {
    console.log('running on port', port)
})