const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

const mongoUrl = 'mongodb+srv://iragulp:root@cluster0.xe6xeql.mongodb.net/Quotes'; // Update with your MongoDB Atlas connection string and database name
const collectionName = 'Quotes'; // Update with your collection name

const matchingFields = ['id', 'name', 'quote', 'author', 'category'];

app.get('/search', async (req, res) => {
  const searchText = req.query.text || '';
  const startCount = parseInt(req.query.start) || 0;
  const endCount = parseInt(req.query.end) || Infinity;

  const matchingRows = [];

  const client = new MongoClient(mongoUrl, { useUnifiedTopology: true });

  try {
    await client.connect();

    const database = client.db();
    const collection = database.collection(collectionName);

    const cursor = collection.find({
      quote: { $regex: searchText, $options: 'i' } // Case-insensitive regex search
    }).skip(startCount).limit(endCount - startCount);

    await cursor.forEach((doc) => {
      const selectedFields = {};
      matchingFields.forEach((field) => {
        selectedFields[field] = doc[field];
      });
      matchingRows.push(selectedFields);
    });
  } finally {
    await client.close();
  }

  res.json(matchingRows);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
