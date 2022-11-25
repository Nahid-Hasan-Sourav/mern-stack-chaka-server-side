
const express = require('express');
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
                categoryName:categoryNames
              }
              console.log("query",query);
              // const cursor= allCategoriesItemsCollection.find(query);
              const items= await allCategoriesItemsCollection.find(query).toArray();
              console.log("Services",items);
              res.send(items);
              
             })

            //  POST/INSERT BOOKING ITEMS ITEMS WILL BE BOOKED NY USERS
             app.post('/bookings', async (req,res)=>{
              const bookingItem=req.body;
              const result=await bookingCollection.insertOne(bookingItem)
              res.send(result)
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