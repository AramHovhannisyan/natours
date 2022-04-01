module.exports = (err, req, res, next) => {

    if(process.env.NODE_ENV == 'production'){

        if(req.originalUrl.startsWith('/api')){
            if(err.isOperational){
                err.statuseCode = err.statuseCode || 500
                err.status = err.status || 'error'

                return res.status(err.statuseCode).json({
                    status: err.status,
                    message: err.message
                })
            }else{
                return res.status(500).json({
                    status: 'error',
                    message: 'Something Went Wrong'
                })
            }
        }else{
            // Rendered Website
            if(err.isOperational){
                err.statuseCode = err.statuseCode || 500
                err.status = err.status || 'error'

                return res.status(err.statuseCode).json({
                    status: err.status,
                    message: err.message
                })
            }else{
                return res.status(err.statuseCode).render('error', {
                    title: 'Something Went Wrong!',
                    msg: 'Please Try Again Later'
                })
            }
        }

            
    }else{
        err.statuseCode = err.statuseCode || 500
        err.status = err.status || 'error'

        if(req.originalUrl.startsWith('/api')){
            res.status(err.statuseCode).json({
                status: err.status,
                message: err.message,
                error: err,
                stack: err.stack
            })
        }else{
            // Rendered Website
            res.status(err.statuseCode).render('error', {
                title: 'Something Went Wrong!',
                msg: err.message
            })
        }
    }

    
}