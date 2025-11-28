const mongoose = require("mongoose");

const astronautSchema = new mongoose.Schema({
  astronautId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  gender: { type: String },
  age: { type: Number },
  nationality: { type: String },
  specialization: { type: String },
  healthBaseline: { type: String },
  photoUrl: { type: String }   // ✅ last field, no comma needed here
}, { timestamps: true });

module.exports = mongoose.model("Astronaut", astronautSchema);


