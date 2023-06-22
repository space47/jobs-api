const Job = require('../models/Job')
const {StatusCodes} = require('http-status-codes')
const {BadRequestError, NotFoundError} = require('../errors')

const getAllJobs = async (req, res) => {
  const jobs = await Job.find({createdBy:req.user.userId}).sort('createdAt')
  res.status(StatusCodes.OK).send({jobs,count:jobs.length});
};

const getJob = async (req, res) => {
  console.log(req.user)
  // take out userId from req.user
  // take out the id from req.params and put into jobId
  const {
    user: {userId},
     params:{id:jobId}
  } = req
  const job = await Job.findOne({ _id: jobId, createdBy: userId})
  // const job = await Job.findOne({_id:req.params.id, createdBy: req.user.userId})
  if(!job){
    throw new NotFoundError(`No job with id ${jobId}`)
  }
  res.status(StatusCodes.OK).json({job});
};

const createJob = async (req, res) => {
  req.body.createdBy = req.user.userId
  const job = await Job.create(req.body)
  res.status(StatusCodes.CREATED).json({job});
};

const updateJob = async (req, res) => {
  const {
    user: {userId},
    params: {id:jobId},
    body: {company, position}
  } = req
  if(company === '' || position === '') {
    throw new BadRequestError('Company or Position fields cannot be empty')
  }
  const job = await Job.findByIdAndUpdate(
    {_id: jobId, createdBy: userId},
    {company,position},
    {new: true, runValidators: true})
  if(!job){
    console.log(job)
    throw new NotFoundError(`No job with id ${jobId}`)
  }
  res.status(StatusCodes.OK).json({job})
};

const deleteJob = async (req,res) => {
  const {
    user: {userId},
    params: {id: jobId}
  } = req
  const job = await Job.findByIdAndDelete({
    _id: jobId, 
    createdBy: userId
  })
  if(!job){
    throw new NotFoundError(`No job with id ${jobId}`)
  }
  res.status(StatusCodes.OK).json({job})
}

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob
};
