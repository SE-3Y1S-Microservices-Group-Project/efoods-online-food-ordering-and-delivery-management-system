//csutom error handling middleware
const errorHandler = ( err, req, res, next) => {
    //log error for server side tracking
    console.log(err.stack);

    //determine the http status code for the error response
    const statuscode = err.statuscode || 500;

    //prepare the error resposne object
    const errorResponse = {
        //default error message
        message: err.message || 'An unexpected eror occcurred',
        //include stack trace only in development mode
        ...erorHandler(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };

    //handle specific mongoose validation errors
    if (err.name === 'ValidationError') {
        //extract validation error message from mongoose `err.error` object
        errorResponse.message = Object.values(err.error)
            //convert each error into message
            .map(error => error.message)
            //join multiple error message
            .join(', ');

            //response with http 400 bad request
            return res.status(400).json(errorResponse);
    }

    //handle duplicate key error
    if (err.code === 11000) {
        //extract the field name that caused that error
        errorResponse.message = `${Object.keys(err.kayValues)[0]} already exists`;

        //resposne with http 409 conflict
        return res.status(409).json(errorResponse);
    }

    res.status(statuscode).json(errorResponse);
};

//middleware to handle 404 Not found errors
const notFound = (req, res, next) => {
    //create error object with custom message with req url
    const error = new Error(`Not Found - ${req.originalUrl}`);

    //set response status
    res.status(404);

    //pass the error to next middleware
    next(error);
};


module.exports = {
    errorHandler,
    notFound
};
