const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const query = require('express/lib/middleware/query');
const res = require('express/lib/response');
require('dotenv').config()
const { decode } = require('jsonwebtoken');
const app = express();
const cors = require('cors')
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors())
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' })
    }
    const token = authHeader?.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbbiden' })
        }
        req.decoded = decoded;

    })
    next()
}

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.ysjbw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {

    try {
        await client.connect();
        const inventoryCollection = client.db('furnob-furniture-warehouse').collection("inventory");
        app.get('/', async (req, res) => {
            const query = {};
            const cursor = inventoryCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })
        app.post('/login', (req, res) => {
            const email = req.body

            const accessToken = jwt.sign(email, process.env.ACCESS_TOKEN, { expiresIn: '1d' });
            res.send(accessToken)
        })
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await inventoryCollection.findOne(query);
            res.send(product);
        })
        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await inventoryCollection.deleteOne(query);
            res.send(result);
        })
        app.post("/", async (req, res) => {
            const doc = req.body;
            const result = await inventoryCollection.insertOne(doc);
            res.send(result)
        })
        app.get('/my-items', verifyToken, async (req, res) => {
            const decodedEmail = req.decoded?.email

            const email = req.query.email;

            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = inventoryCollection.find(query);
                const result = await cursor.toArray();
                res.send(result)
            }
            else {
                res.status(403).send({ message: 'Forbbiden' })
            }




        })
        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body

            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: data.quantity
                },

            };

            const result = await inventoryCollection.updateOne(filter, updateDoc, options);
            res.send(result)

        })
    }
    finally {

    }
}
app.get('/', (req, res) => {
    res.send("Running dental care")
})
run().catch(console.dir);

app.listen(port, () => {
    console.log(` listening on port ${port}`)
})