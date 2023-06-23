require('dotenv').config()
require('express-async-errors')

// extra security packages
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')


// swagger
const swaggerUI = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./swagger.yaml')


const express = require('express')
const app = express()

// connectDB
const connectDB = require('./db/connect')

// routers
const authRouter = require('./routes/auth')
const jobsRouter = require('./routes/jobs')
const authentication = require('./middleware/authenticated')

// error handler import
const notFoundMiddleware = require('./middleware/not-found')
const erroHandlerMiddlerware = require('./middleware/error-handler')

app.set('trust proxy',1);
app.use(
    rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    })
)
app.use(express.json())
app.use(helmet())
app.use(cors())
app.use(xss())

// dummy route to test after deployment

app.get('/',(req,res)=> {
    res.send('<h1>Jobs API</h1><a href = "/api-docs">Document</a>')
})

app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(swaggerDocument))

//extra packages

// routes 
app.use('/api/v1/auth',authRouter)
app.use('/api/v1/jobs',authentication,jobsRouter)

//using error handler middlewares

app.use(notFoundMiddleware)
app.use(erroHandlerMiddlerware)


const port = process.env.PORT || 3000
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port, console.log(`Server is listening on port ${port}...`))
    } catch (error) {
        console.log(error)        
    }
}

start()