require('dotenv').config();
const mongoose = require('mongoose');
const Annotation = require('./models/Annotation');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    await Annotation.deleteMany({});
    console.log("Database cleared successfully! Clean slate for testing.");
    process.exit(0);
  })
  .catch(err => {
    console.error("Error clearing DB:", err);
    process.exit(1);
  });
