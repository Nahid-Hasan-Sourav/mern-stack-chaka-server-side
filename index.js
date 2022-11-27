
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();


app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sfv0aqa.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// console.log(uri)


async function run() {
        try{
            const categoryCollection=client.db('chakadb').collection('categories');
            const allCategoriesItemsCollection=client.db('chakadb').collection('allCategoriesItems');
            const bookingCollection=client.db('chakadb').collection('allBookingsItems');
            const userCollection=client.db('chakadb').collection('users');


            // sava user info and generate webtoken
            app.put('/user/:email',async(req,res) => {
              const email=req.params.email;
              const user=req.body;
              const filter={email:email}
              const options={upsert:true}
              const updateDoc={
                $set:user,
              }
              const result=await userCollection.updateOne(filter,updateDoc,options)
              console.log("Save Info :",result)
              const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1d'})
              res.send({result,token})
            })


            //GET THE ALL CATEGORIES
            app.get('/categories', async(req, res) =>{           
              const query ={}
              const categories = await  categoryCollection.find(query).toArray();
              console.log(categories);
              res.send(categories);
            })

            // GET THE SPECIFIC CATEGORY BY CATEGORY NAME
            app.get('/categorie/:id', async(req, res)=>{
              const categoryNames =req.params.id;
              console.log("Category Name ",categoryNames);
              
              const query={
                categoryId:categoryNames
              }
              console.log("query",query);
              // const cursor= allCategoriesItemsCollection.find(query);
              const items= await allCategoriesItemsCollection.find(query).toArray();
              console.log("Services",items);
              res.send(items);
              
             })

            // POST SELLER PRODUCT IN allCategoriesItemsCollection
            app.post('/allCategoriesItemsCollection', async (req,res)=>{
              const product=req.body;
              const result=await allCategoriesItemsCollection.insertOne(product)
              res.send(result)
             })

            //  POST/INSERT BOOKING ITEMS ITEMS WILL BE BOOKED NY USERS
             app.post('/bookings', async (req,res)=>{
              const bookingItem=req.body;
              const result=await bookingCollection.insertOne(bookingItem)
              res.send(result)
             })

            //GET THE SELLER POSTED PRODUCT BY SELLER EMAIL THAT WILL BE SHOW IN MY ORDERS
            app.get('/dashboard/seller/my-products/:email', async (req, res) => {
              const email=req.params.email
              const query={'userInfo.userEmail':email}

              const sellerProduct= await allCategoriesItemsCollection.find(query).toArray()
              console.log(sellerProduct)
              res.send(sellerProduct)
            })

            //  GET SINGLE USER FOR CHECKING HIS/HER ROLE
            app.get('/user/:email', async (req, res) => {
              const email=req.params.email

              const query={email : email}

              const user= await userCollection.findOne(query)
              // console.log(user.role)
              res.send(user)
            })
        
        }
        finally{

        }

}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello From Chaka!')
  })
  
  app.listen(port, () => {
    console.log(`Chaka App listening on port ${port}`)
  })