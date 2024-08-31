const {validationResult} = require('express-validator')
const signup = (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()){
        const formattedErrors = {}
        errors.array().forEach(error=>{
            formattedErrors[error.path] = error.msg
        })

        return res.status(400).send({"errors": formattedErrors})
    }
    const {username, email, password, phoneNumber} = req.body
    const image = req.file

    res.send({username, password, email, phoneNumber})
}

const login = (req, res) =>{
    const errors = validationResult(req)
    if (!errors.isEmpty()){
        const formattedErrors = {}
        errors.array().forEach(error=>{
            formattedErrors[error.path] = error.msg
        })

        return res.status(400).send({"errors": formattedErrors})
    }
    const {username, email} = req.body
    res.send()
}

const logout = (req, res) =>{
    res.send()
}

exports.login = login
exports.signup = signup
exports.logout = logout