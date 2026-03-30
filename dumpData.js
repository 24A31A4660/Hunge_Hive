const mongoose = require('mongoose');
const fs = require('fs');

async function dumpData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hungerhive');
    console.log('Connected to MongoDB. Fetching data...');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    const dump = {};
    for (const coll of collections) {
      if (coll.name === 'system.profile') continue;
      const records = await db.collection(coll.name).find({}).limit(20).toArray();
      const count = await db.collection(coll.name).countDocuments();
      dump[coll.name] = {
        total_records: count,
        latest_sample_data: records
      };
    }
    
    const jsonStr = JSON.stringify(dump, null, 2);
    // Write directly to artifacts directory so the user can see it! 
    // And to current dir in UTF-8
    fs.writeFileSync('db_dump_utf8.json', jsonStr, 'utf-8');
    console.log('Done!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error fetching data:', error);
    process.exit(1);
  }
}

dumpData();
