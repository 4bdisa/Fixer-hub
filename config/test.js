import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://fixerhub:fixerhub@cluster0.gjavc.mongodb.net/Fixerhub?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("✅ Connected successfully to server");
    
    const db = client.db();
    console.log(`📁 Database name: ${db.databaseName}`);
    
    // Test a simple query
    const collections = await db.listCollections().toArray();
    console.log("📂 Collections:", collections.map(c => c.name));
    
  } finally {
    await client.close();
  }
}

run().catch(console.dir);