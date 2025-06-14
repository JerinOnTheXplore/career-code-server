const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 3000 ;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

// middleware
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const logger = (req,res,next) =>{
  console.log('Inside the logger  middlewar');
  next();
}

const verifyToken = (req,res,next)=>{
  const token = req?.cookies?.token;
  console.log('Cookie in the middle war',token);
  if(!token){
    return res.status(401).send({message: 'Unauthorized access'})
  }
  // verify token
  jwt.verify(token,process.env.JWT_ACCESS_SECRET,(err,decoded)=>{
    if(err){
      return res.status(401).send({message: 'unauthorized access'})
    }
    req.decoded = decoded;
    next();
  })

  // 
  
}

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

// jwt token related api
app.post('/jwt',async(req,res)=>{
  const userData = req.body;
  const token = jwt.sign(userData, process.env.JWT_ACCESS_SECRET,{expiresIn: '1d'})
   
  // set the token in the cookies
  res.cookie('token',token, {
    httpOnly: true,
    secure: false
  })

  res.send({success: true})
})

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

app.get('/applications',logger,verifyToken, async (req,res)=>{
  const email = req.query.email;

  // console.log('Inside application api',req.cookies);
  if(email !== req.decoded.email){
    return res.status(403).send({message: 'forbidden access'})
  }
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