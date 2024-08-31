const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const path = require("path")

mongoose.connect("mongodb://localhost:27017/digital-idir").then(()=>{console.log("Connected To The DataBase")}).catch((e)=>{console.log(e)})
const authRouter = require("./routes/auth")



const app = express()
app.use("/uploads/images", express.static(path.join("uploads", "images")))
app.use(cors())
app.use(cookieParser())
app.use(express.json())

app.get("/", (req,res)=>{
    res.send("Hello World")
})

app.use("/api/v1/auth", authRouter)


app.listen(5000)