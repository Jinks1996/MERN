const jwt = require('jsonwebtoken');

const validateSession = (req, res, next) => {
    try{
        const token = req.headers.authorization;
        let decoded = jwt.verify(token, 'secret');
            req.decoded = decoded._id;
        next();
    }catch(e){
        res.status(599).send({'msg' : 'Session Timeout'});
    }

}

module.exports = validateSession