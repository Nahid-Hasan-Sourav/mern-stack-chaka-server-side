
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();


app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sfv0aqa.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// console.log(uri)


    // jwt 
    function verifyJWT(req, res, next) {
      const authHeader = req.headers.authorization;
      if(!authHeader){
        return res.status(401).send({message:'unauthorized access'});

      }

      const token = authHeader.split(' ')[1]
      jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,function(err,decoded){
        if(err){
          return res.status(403).send({message:'Forbidden access'})
        }
        console.log("decoded: ",decoded)
        req.decoded = decoded
        next()
      })
    }

async function run() {
        try{
            const categoryCollection=client.db('chakadb').collection('categories');
            const allCategoriesItemsCollection=client.db('chakadb').collection('allCategoriesItems');
            const bookingCollection=client.db('chakadb').collection('allBookingsItems');
            const userCollection=client.db('chakadb').collection('users');
            const advertiseProductCollection=client.db('chakadb').collection('advertiseProduct');
            const wishlistCollection=client.db('chakadb').collection('wishlist');


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
              console.log("Token :",token)
              res.send({result,token})
            })


            //GET THE ALL CATEGORIES
            app.get('/categories', async(req, res) =>{           
              const query ={}
              const categories = await  categoryCollection.find(query).toArray();
              // console.log(categories);
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
              // console.log("Services",items);
              res.send(items);
              
             })

            // POST SELLER PRODUCT IN allCategoriesItemsCollection
            app.post('/allCategoriesItemsCollection', verifyJWT,async (req,res)=>{
              const product=req.body;
              const result=await allCategoriesItemsCollection.insertOne(product)
              res.send(result)
             })

            //  POST/INSERT BOOKING ITEMS ITEMS WILL BE BOOKED NY USERS
             app.post('/bookings',verifyJWT, async (req,res)=>{
              const bookingItem=req.body;
              const result=await bookingCollection.insertOne(bookingItem)
              res.send(result)
             })

            //GET THE SELLER POSTED PRODUCT BY SELLER EMAIL THAT WILL BE SHOW IN MY ORDERS
            app.get('/dashboard/seller/my-products/:email', async (req, res) => {
              const email=req.params.email
              console.log("My orders",email)
              const query={'userInfo.userEmail':email}

              const sellerProduct= await allCategoriesItemsCollection.find(query).toArray()
              // console.log(sellerProduct)
              res.send(sellerProduct)
            })
            // SELLER PRODUCTS DELETE API
            app.delete('/dashboard/seller/my-products/deletes/:id', verifyJWT,async (req, res) => {
              const id = req.params.id;
              console.log('trying to delete', id);
              const query = { _id: ObjectId(id) }
              const result = await allCategoriesItemsCollection.deleteOne(query);
              // console.log(result);
              res.send(result);
          });

            //  GET SINGLE USER FOR CHECKING HIS/HER ROLE
            app.get('/user/:email',verifyJWT, async (req, res) => {
              const email=req.params.email

              const query={email : email}

              const user= await userCollection.findOne(query)
              // console.log(user.role)
              res.send(user)
            })

            //THIS API WILL ADDED PRODUCT IN ADVERTISE COLLECTION
            app.post('/advertiseProductCollection',verifyJWT, async (req,res)=>{
              const product=req.body;
              delete product._id
              console.log("Product: " , product)
              const result=await advertiseProductCollection.insertOne(product)
              res.send(result)
             })

            //  ADDED IN WISHLIT
            app.put('/wish-list',async (req,res)=>{
              const wishlist=req.body;
              // delete wishlist._id
              console.log("wishlist: " , wishlist)
              const result=await wishlistCollection.insertOne(wishlist)
              res.send(result)
             })

             //GET THE ALL ADVERTISE product
            app.get('/advertiseProduct', async(req, res) =>{ 

              const query ={}
              const categories = await  advertiseProductCollection.find(query).toArray();
              console.log(categories);
              res.send(categories);
            })


          // GET ALL SELLERS
          app.get('/all-seller', verifyJWT,async (req, res) => {
            const email=req.params.email
            const query={role:'seller'}
            const user= await userCollection.find(query).toArray()
            console.log(user)
            res.send(user)
          })

          // added verify seller status
          app.put('/users/seller/:id',verifyJWT, async (req, res) => {       
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                  sellerStatus:'verified'
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc, options);
            console.log("verified :",result)
            res.send(result);
        })

        // this api for admin can delete seller
        app.delete('/users/seller/deletes/:id', verifyJWT,async (req, res) => {
          const id = req.params.id;
          // console.log('trying to delete', id);
          const query = { _id: ObjectId(id) }
          const result = await userCollection.deleteOne(query);
          // console.log(result);
          res.send(result);
      });
     
      // GET ALL ORDERS BY SPECIFIC BUYERS
      app.get('/buyers/my-products/:email',verifyJWT, async (req, res) => {
        const email=req.params.email

        const query={email : email}

        const user= await bookingCollection.find(query).toArray();
        // console.log(user.role)
        res.send(user)
      })
      app.get('/dashboard/wishlist/:email',async (req, res) => {
        const email=req.params.email

        const query={email : email}

        const user= await wishlistCollection.find(query).toArray();
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