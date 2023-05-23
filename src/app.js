require('dotenv').config();

const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const bcrypt = require('bcryptjs')

const path = require('path')
const hbs = require('hbs')
const cookieParser = require('cookie-parser')
const auth = require('./middleware/auth')
const Register = require('./models/register')

require("./db/conn")

//When lookup error comes make templatesPath
const staticPath = path.join(__dirname, "../public")
const templatesPath = path.join(__dirname, "../templates/views")
const partialsPath = path.join(__dirname,"../templates/partials")

app.set("views",templatesPath)
app.use(express.static(staticPath))
app.set("view engine","hbs")

hbs.registerPartials(partialsPath)

app.use(express.json())
app.use(express.urlencoded({extended:false}));
app.use(cookieParser())

// console.log(process.env.SECRET_KEY)

app.get("/",(req,res)=>{
    res.render("index")
})

app.get("/secret", auth, (req,res)=>{
    console.log(`This is cookie: ${req.cookies.jwt}`)
    res.render("secret")
})

app.get("/login",(req,res)=>{
    res.render("login")
})



app.get("/logout", auth, async(req,res)=>{
    try{
        console.log(req.user)

        // Single Logout
        // req.user.tokens = req.user.tokens.filter((currElement) =>{
            // return currElement.token != req.token
        // })

        // Logout from all devices
        req.user.tokens = [];

        res.clearCookie("jwt")
        console.log("Logout successfully")

        await req.user.save()
        res.render("login")

    }
    catch(error){
        res.status(500).send(error)
    }
})


app.post("/",async(req,res)=>{
    try{
        // console.log(req.body.firstname)
        // res.send(req.body.firstname+""+req.body.lastname)

        const password = req.body.password;
        const cpassword = req.body.cpassword;

        if(password === cpassword){
            
            const regEmp = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                password: password,
                confirmpassword: cpassword
            })

            console.log(`The success part is: ${regEmp}`)

            // AFTER GETTING THE PASSWORD AND BEFORE STORING PASSWORD IN DATABASE, IN MIDDLE WE HAVE TO DO HASHING OF THE PASSWORD 
            // THIS CONCEPT IS CALLED MIDDLEWARE 
            const token = await regEmp.generateAuthToken();
            console.log(`The token part is: ${token}`)

            // The res.cookie() function is used to set the cookie name to value
            // The value parameter may be a string or an object converted to JSON

            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 70000),
                httpOnly: true
            })
            console.log(cookie)

            const registered = await regEmp.save();
            console.log(`The page part ${registered}`)

            res.status(201).render("index")
        }
        else{
            res.send("Password not matching")
        }
    }
    catch(e){
        res.status(400).send(e);
        console.log("The error part page")
    }
})


//Login check
app.post("/login", async(req,res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;

        // console.log(`${email} and ${password}`)

        const useremail = await Register.findOne({email:email})
        // res.send(useremail.password)
        // console.log(useremail)

        // Comparing database password == user entered password
        const isMatch = await bcrypt.compare(password, useremail.password)

        const token = await useremail.generateAuthToken();
        console.log(`The token part is: ${token}`)

        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 70000),
            httpOnly: true
        })

        console.log(`This is cookie: ${req.cookies.jwt}`)

        if(isMatch){
            res.status(201).render("index")
        }
        else{
            res.send("Password not matching")
        }
    }
    catch(e){
        res.status(400).send("Invalid Login details")
        console.log(e)
    }
})

//PASSWORD HASH
/*
const bcrypt = require('bcryptjs')

const securePassword = async (password)=>{
                                        //   (password in db, No. of rounds of hashing)
    const passwordHash = await bcrypt.hash(password,10);
    console.log(passwordHash);

    const passwordMath = await bcrypt.compare("khush@3", passwordHash)
    console.log(passwordMath) 
}
securePassword("khush@03")
*/


//JWT TOKENIZATION
/*
const jwt = require("jsonwebtoken")

const createToken = async() =>{
    const token = await jwt.sign({_id: "64677277ef6bbad04c0b5357"}, "fhsbjhfbjsabhfvkjshjhvfbdjshbvjds",{
        expiresIn: "2 seconds"
    })
    console.log(token);

    const userVerify = await jwt.verify(token, "fhsbjhfbjsabhfvkjshjhvfbdjshbvjds")
    console.log(userVerify)
}

createToken()
*/


app.listen(port,()=>{
    console.log(`Listening to port ${port}`)
})