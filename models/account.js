var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passpostLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
  username: { type: String, unique: true },
  karma: { type: Number, default: 0 },
  comments: [String]
});

Account.methods.incKarma = function () {
  this.karma += 1;
};

Account.methods.decKarma = function () {
  this.karma -= 1;
};

Account.plugin(passpostLocalMongoose);

module.exports = mongoose.model('Account', Account);
