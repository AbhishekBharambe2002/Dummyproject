const mongoose = require('mongoose');
const  Userschema =  new mongoose.Schema({
    image : String
})
const UserModel = mongoose.model("images", Userschema)
module.exports = UserModel