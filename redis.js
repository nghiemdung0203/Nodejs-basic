const { createClient } = require('redis');
require('dotenv').config();


const client = createClient();

  client.on("error", (err) => {
    console.error("Redis error:", err);
  });

  
  const connectRedis = async () => {
    try {
      await client.connect(); // Await the connection
      console.log("Connected to Redis");
    } catch (err) {
      console.error("Could not connect to Redis:", err);
    }
  };
 
  connectRedis();

  module.exports = client