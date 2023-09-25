const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const UserModel = require("./models/User")
const app = express();
const http = require("http").createServer(app)
app.use(cors());	
app.set("view engine", "ejs")
const formidable = require("express-formidable")
app.use(formidable({
    multiples: true, // request.files to be arrays of files
}))
 
const fileSystem = require("fs")
app.use("/uploads", express.static(__dirname + "/uploads"))
function callbackFileUpload(images, index, savedPaths = [], success = null) {
    const self = this
 
    if (images.length > index) {
 
        fileSystem.readFile(images[index].path, function (error, data) {
            if (error) {
                console.error(error)
                return
            }
 
            const filePath = "uploads/" + new Date().getTime() + "-" + images[index].name
             
            fileSystem.writeFile(filePath, data, async function (error) {
                if (error) {
                    console.error(error)
                    return
                }
 
                savedPaths.push(filePath)
 
                if (index == (images.length - 1)) {
                    success(savedPaths)
                } else {
                    index++
                    callbackFileUpload(images, index, savedPaths, success)
                }
            })
 
            fileSystem.unlink(images[index].path, function (error) {
                if (error) {
                    console.error(error)
                    return
                }
            })
        })
    } else {
        success(savedPaths)
    }
}
const port = process.env.PORT || 3001
http.listen(port, function () {
    console.log("Server started running at port: " + port)
    mongoose.connect('mongodb://127.0.0.1:27017/multiple_images_upload', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() =>  {
    const db = mongoose.connection;
    console.log("Database connected")
    app.get("/", async function (request, result) {
        result.render("home")
    })
    app.post("/uploadImages", async function (request, result) {
        const images = []
        if (Array.isArray(request.files.images)) {
            for (let a = 0; a < request.files.images.length; a++) {
                images.push(request.files.images[a])
            }
        } else {
            images.push(request.files.images)
        }
     
        callbackFileUpload(images, 0, [], async function (savedPaths) {
            await db.collection("images").insertOne({
                images: savedPaths
            })
     
            result.send("Images has been uploaded.")
        })
    })
    app.get('/getimage', (request, result) =>{
      UserModel.find()
      .then(images => result.json(images))
      .catch(err => result.json(err))
    })
  })
 
    // [routes]
})

