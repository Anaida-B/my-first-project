const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/myprojectdb")
  .then(() => {
    console.log("MongoDB connected!");
    process.exit();
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit();
  });
