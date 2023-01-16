const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
});

// make the id as a string not object and remove the v property
noteSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Note", noteSchema);
