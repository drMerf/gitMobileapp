var mongoose = require('mongoose');
var bcrypt = require ('bcrypt-nodejs');
var userSchema  = new mongoose.Schema({

  username: String,
  password: String,
  email: String,
  role: Number});
  // generating a hash*//*
  
  userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  };

  // checking if password is valid
  userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
  };

module.exports = mongoose.model('users', userSchema);
