const express = require('express')
const cors = require('cors')

const authRouter = require("./routes/auth")

const app = express()
app.use(cors())

app.get("/", (req,res)=>{
    res.send("Hello World")
})

app.use("/api/v1/auth", authRouter)


app.listen(5000)