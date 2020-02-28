const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : true
    },
    lastName : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        //unique : true,
        trim : true,
        lowercase : true,
        validate (value) {
            if(!validator.isEmail(value)){
                throw new Error('Invalid Email Id');
            }
        }
    },
    password : {
        type : String,
        required : true
    },
    mobile : {
        type : Number
    },
    age : {
        type : Number,
        required : true,
        default : 18,
        validate(value){
            if(value < 0){
                throw new Error('Age must be positive number');
            } 
        }
    },
    isAdmin : {
        type : String,
        default : 'user'
    }    
})

userSchema.methods.generateAuthToken = async function() {
    const token = await jwt.sign({_id: this._id.toString(), exp: Math.floor(Date.now() / 1000) + (60 * 60)}, 'secret');
    // this.tokens = this.tokens.concat({ token });
    // await this.save();
    return token;
}

userSchema.statics.findByCredentials = async(email, password) => {
    const user = await User.findOne({email});
    if(!user){
        throw new Error('Unable to login');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        throw new Error('Unable to login');
    }
    return user;
}

userSchema.pre('save', async function(next) {
    if(this.isModified('password'))
        this.password = await bcrypt.hash(this.password, 8);

    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User;
