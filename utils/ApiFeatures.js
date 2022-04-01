class APIFeatures {
    constructor(queryObject, queryParams){
        this.queryObject = queryObject
        this.queryParams = queryParams
    }

    filter(){

        //  1) filtering
        const queryObj = {...this.queryParams}
        const excludedFields = ['page', 'sort', 'limit', 'fields']
        excludedFields.forEach(el => delete queryObj[el])

        //  advanced filtering

        if(queryObj.duration){
            if(queryObj.duration.gte) queryObj.duration.gte = Number(queryObj.duration.gte)
            if(queryObj.duration.gt) queryObj.duration.gte = Number(queryObj.duration.gt)
            if(queryObj.duration.lte) queryObj.duration.gte = Number(queryObj.duration.lte)
            if(queryObj.duration.lt) queryObj.duration.gte = Number(queryObj.duration.lt)
        }
        

        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
        queryStr = JSON.parse(queryStr)

        this.queryObject = this.queryObject.find(queryStr)

        return this
    }

    sort(){

        if(this.queryParams.sort){
            const sortBy = this.queryParams.sort.split(',').join(' ')
            this.queryObject.sort(sortBy)
        }else{
            this.queryObject.sort('-createdAt')
        }

        return this
    }

    limitFields(){

        if(this.queryParams.fields){
            const fields = this.queryParams.fields.split(',').join(' ')
            this.queryObject.select(fields)
        }else{
            this.queryObject.select('-__v')
        }

        return this
    }

    paginate(){

        const page  = this.queryParams.page * 1 || 1
        const limit = this.queryParams.limit * 1 || 100
        const skip  = (page - 1) * limit

        this.queryObject = this.queryObject.skip(skip).limit(limit)

        return this
    }
}

module.exports = APIFeatures