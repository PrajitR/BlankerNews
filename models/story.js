var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Story = new Schema({
  url: String,
  title: String,
  text: String
});

module.exports = mongoose.model('Story', Story);
