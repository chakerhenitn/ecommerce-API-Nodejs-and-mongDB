function errorHandler(err, req, res, next){
    //jwt authentication error
    if (err.name === 'UnauthorizedError') {
       return res.status(401).json({message: 'The user is not authrized', err})
    }
    if (err.name === 'validationError') {
        //validation error
       return res.status(401).json({message: err})
    }
 
    //default to 500 server error
    return res.status(500).json(err)
}

module.exports = errorHandler;