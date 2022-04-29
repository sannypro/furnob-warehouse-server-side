const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const query = require('express/lib/middleware/query');
const res = require('express/lib/response');
require('dotenv').config()
const app = express();
const cors = require('cors')
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors())


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
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await inventoryCollection.findOne(query);
            res.send(product);
        })
    }
    finally {

    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(` listening on port ${port}`)
})