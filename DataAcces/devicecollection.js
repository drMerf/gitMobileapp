var mongoose = require('mongoose');

var regSchema = new mongoose.Schema({
  _id : false,
  by:String,from:String,
  until:String,
  username:String});

var deviceSchema = new mongoose.Schema({
  devicename: String,
  devicetype: String,
  devicedescription: String,
  imagebyt:String,
  deviceregistrations:[regSchema]
  });

  module.exports = mongoose.model('devices', deviceSchema)
