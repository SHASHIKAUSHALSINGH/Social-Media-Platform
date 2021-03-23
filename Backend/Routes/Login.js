const express= require("express");
const router = express.Router();
const userDB = require("../Database/Users");
const crypto = require("crypto");
const CheckUserForExisting = async (Email) =>{
    let Exists = await userDB.findUserEmail(Email);
    return Exists;
}
const decipher = (salt,iv, ReqPassword) =>{
 const key  = process.env.key;
 // Decrypting Salt
 let dec = crypto.createDecipheriv("aes-256-cbc",key,iv.buffer);
 let decrypted = dec.update(salt,"hex","hex");
 decrypted += dec.final("hex");
 // Encrypting Req Pass with decrypted Salt
 const hashedReqPass = crypto.createHmac("sha3-512", decrypted).update(ReqPassword).digest("hex");
 return hashedReqPass;

}

router.post("/",express.urlencoded({extended:true}),express.json(),(req,res)=>{
    let body = req.body;
    CheckUserForExisting(body.Email).then((response)=>{
        const reqPassword = decipher(response[0].Params.Salt, response[0].iv, body.Password)
        if (reqPassword === response[0].Params.Password)
        {
            console.log("Login Succeeded");
            res.status(200).json({status:`Login Successful of Email ${response[0].Email}`});
        }
        else
        {
            console.log("Email or Passoword Wrong");
            res.status(401).json({status:"Login not authorized"});
        }

    }).catch((err)=>{
        console.error("Something Went Wrong While Logging in \n", err);
        res.status(400).json({status:"Some thing went wrong try refreshing the page and logging in again"})
    });
})
exports = module.exports = router;