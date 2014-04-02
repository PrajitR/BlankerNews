var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Story = new Schema({
  url: String,
  title: String,
  text: String,
  storyId: String,
  submitter: String,
  date: { type: Date, default: Date.now },
  comments: [ String ]
});

module.exports = mongoose.model('Story', Story);
