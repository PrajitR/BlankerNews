var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passpostLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
  name: String,
  karma: Number
});

Account.plugin(passpostLocalMongoose);

module.exports = mongoose.model('Account', Account);
