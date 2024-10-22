// redisClient.js
const { createClient } = require("redis");
require("dotenv").config();

class RedisClient {
  constructor() {
    if (RedisClient.instance) {
      return RedisClient.instance;
    }

    this.client = null;
    RedisClient.instance = this;
  }

  async connect() {
    if (!this.client) {
      this.client = createClient();
      this.client.on("error", (err) => {
        console.error("Redis error:", err);
      });

      try {
        await this.client.connect();
        console.log("Connected to Redis");
      } catch (error) {
        console.error("Could not connect to Redis:", err);
        throw err;
      }
    }
    return this.client;
  }

  async get(key) {
    if (!this.client) {
      await this.connect();
    }

    return this.client.get(key);
  }

  async setEx(key, timeToLive, value) {
    if (!this.client) {
      await this.connect();
    }

    return this.client.setEx(key, timeToLive, value);
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
    }
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;