var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Story = new Schema({
  url: String,
  title: String,
  text: String,
  storyId: String,
  submitter: String,
  date: { type: Date, default: Date.now },
  upvote: { type: Number, default: 0 },
  downvote: { type: Number, default: 0 },
  votedUsers: [ String ],
  comments: [ { 
    submitter: String, 
    comment: String,
    id: String,
    parentPath: String,
    date: { type: Date, default: Date.now },
    upvote: { type: Number, default: 0 },
    downvote: { type: Number, default: 0 },
    votedUsers: [ String ]
  } ]
});

module.exports = mongoose.model('Story', Story);
