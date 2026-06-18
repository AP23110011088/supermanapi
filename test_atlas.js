const mongoose = require('mongoose');

const username = 'niksrock20_db_user';
const password = 'tPyTydt8VXBwyE8Z';
const host = 'superhero.slbb21a.mongodb.net';

async function testConnection() {
  const uri = `mongodb+srv://${username}:${password}@${host}/?retryWrites=true&w=majority`;
  console.log(`Testing username: ${username}...`);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`\nSUCCESS! Username "${username}" connected successfully.`);
    await mongoose.disconnect();
  } catch (err) {
    console.log(`Failed for ${username}: ${err.message}`);
  }
}

testConnection();
