const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000 ;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oeq8sgh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

 const jobsCollection = client.db('careerCode').collection('jobs');
 const applicationCollection = client.db('careerCode').collection('applications')

// jobs api
app.get('/jobs',async (req,res)=>{

const email = req.query.email;
const query = {};
if(email){
  query.hr_email = email;
}

  const cursor = jobsCollection.find(query);
  const result = await cursor.toArray();
  res.send(result);
});

app.get('/jobs/:id',async (req,res)=>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)};
  const result = await jobsCollection.findOne(query);
  res.send(result);
});

// app.get('/application/:id',()=>{})
app.get('/applications/job/:job_id', async (req,res)=>{
  const job_id = req.params.job_id;
  const query = {jobId: job_id};
  const result = await applicationCollection.find(query).toArray();
  res.send(result);
})


app.post('/jobs',async(req,res)=>{
  const newJob = req.body;
  console.log(newJob);
  const result = await jobsCollection.insertOne(newJob);
  res.send(result);
})

// job application related apis

app.get('/applications', async (req,res)=>{
  const email = req.query.email;
  const query = {
    applicant: email
  }
  const result =await applicationCollection.find(query).toArray();
  res.send(result);
});

app.post('/applications', async (req,res) =>{
  const application = req.body;
  console.log(application);
  const result = await applicationCollection.insertOne(application);
  res.send(result);
});

app.patch('/application/:id', async (req,res)=>{
  const id = req.params.id;
  const filter = {_id: new ObjectId(id)};
  const updatedDoc = {
    $set: {
      status: req.body.status
    }
  }
  const result = await applicationCollection.updateOne(filter,updatedDoc);
  res.send(result);
})

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('Career code is cooking');
});

app.listen(port,()=>{
   console.log(`Career code is running on port ${port}`);
})