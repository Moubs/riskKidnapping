mongoose = require 'mongoose'
exports.isAdmin = (req,res) ->
  Resource = mongoose.model 'User'
  if req.session.passport?
    Resource.findById(req.session.passport.user).exec (err,resource) ->
      if resource.local.admin == true
        req.session.isAdmin = true
      else
        req.session.isAdmin = false
  else
    req.session.isAdmin = false

exports.GetAllUsers = (req,res) ->
  Resource = mongoose.model 'User'
  Resource.find().select('local.email local.admin').sort('-local.admin local.email')
  .exec (err,coll)->
    res.send(coll)

exports.grantAdmin = (req,res) ->
  Resource = mongoose.model 'User'
  Resource.find({"local.email":req.body.email}).update({$set : {"local.admin":true}})
  .exec (err, resource) ->
    Resource.find().select('local.email local.admin').sort('-local.admin local.email')
    .exec (err,coll)->
      res.send(coll)
