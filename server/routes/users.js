const express = require('express');
const router = express.Router();
const validateSession = require('../middlewares/auth');
const User = require('../models/users');
const axios = require('axios');

/* GET users listing. */
router.post('/signin', async function(req, res, next) {

  try{
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken(); 
    console.log(user);
    res.status(200).json({
      success: true,
      message: 'Successfully logged In',
      severity : 'success',
      user: user,
      token: token,});
  }catch(err){
    res.status(400).json({
      success: false,
      message: 'Invalid Credentials',
      severity : 'warning'});
    // console.log('/signin ---->',err);
  }
});

router.post('/signup', async function (req, res) {
  let user = await User.findOne({email : req.body.email}, 'email', {lean: true});
  if(user){
    res.send({'msg': 'Email Id must be Unique', 'severity' : 'warning'})
  }else
  {
    if(req.body.isAdmin === true)
    req.body.isAdmin = 'pending';    
    user = new User(req.body);
    try {
      await user.save();
      res.status(201).send({'msg': 'Successfully Registered', 'severity' : 'success'});
    } catch(error) {
      console.log('/signup ---->',error);
      res.status(400).send();
    }
  }

});

router.get('/users', validateSession, async (req, res) => {
  try{
    let users = await User.find({isAdmin : {$ne :'pending'}});
    let adminRequests = await User.find({isAdmin : 'pending'}); 
    let admins = await User.find({ $or : [{isAdmin : 'superadmin'}, {isAdmin : 'admin'}]});
    let allUsers = {
      users : users,
      requests : adminRequests,
      admins : admins
    }
    res.status(200).send(allUsers);
  }catch(e){
    console.log(e);
  }
})

router.get('/facebook/login', async (req,res) => {

  try{

    let token_details = await axios({
        url: 'https://graph.facebook.com/v4.0/oauth/access_token',
        method: 'get',
        params: {
          client_id: 495795461139566,
          client_secret: 'b6b6900cc01231a6c9da486c30e3ac3e',
          redirect_uri: 'http://localhost:3010/api/user/facebook/login',
          code: req.query.code, 
        },
      });
    
      console.log('token',token_details);

    // if(token_details.data && token_details.data.access_token) // { access_token, token_type, expires_in }
    // {
    //   let user_data  = await axios({
    //     url: 'https://graph.facebook.com/me',
    //     method: 'get',
    //     params: {
    //       fields: ['id', 'email', 'first_name', 'last_name'].join(','),
    //       access_token: token_details.data.access_token, 
    //     },
    //   });

      // if(user_data){
      //   res.status(200).json({
      //     success: true,
      //     message: 'Successfully logged In',
      //     severity : 'success',
      //     user: { 
      //             _id: user_data.data.id,
      //             firstName: user_data.data.first_name,
      //             lastName: user_data.data.last_name } ,
      //     token: token});
      // }
    
    }
    catch(e){ 
    console.log(e);
  }

}) 

module.exports = router;
