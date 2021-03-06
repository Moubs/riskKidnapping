mongoose = require 'mongoose'
exports.create = (req, res) ->
  Resource = mongoose.model('Country')
  fields= req.body
  r = new Resource(fields)
  r.save (err, resource) ->
    #res.send({error: err}) if err?
    Resource.findOne().byName(r.name).exec (err, resource) ->
      if res?
        res.send(resource[0]) if resource?

exports.update = (req, res) ->
  Resource = mongoose.model('Country')
  delete req.body._id
  fields = req.body
  fields.name = fields.name.toLowerCase() if fields.name?
  if req.params.id?
    Resource.findByIdAndUpdate req.params.id, {
      $set: fields }, (err, resource) ->
        #res.send({ error: err }) if err?
        res.send(resource)
  else if req.body.name?
     Resource.find().byName(fields.name).update({
      $set: fields}, (err, resource) ->
        #res.send({ error: err }) if err?
        Resource.findOne().byName(fields.name).exec (err, resource) ->
          if res?
            res.send(resource[0]) if resource?
    )

exports.save = (req,res)->
  Resource = mongoose.model('Country')
  Resource.find().byName(req.body.name.toLowerCase()).exec (err, resource) ->
    if resource.length
      exports.update(req,res)
    else
      exports.create(req,res)

exports.retrieve = (req, res) ->
  Resource = mongoose.model('Country')
  #console.log req
  if req.body.name?
    Resource.findOne().byName(req.body.name.toLowerCase()).exec (err, resource) ->
      #res.send({error: err}) if err?
      res.send(resource[0]) if resource?
  else
    Resource.find {}, (err, coll) ->
      #res.send({ error: err }) if err?
      res.send(coll)

exports.delete = (req,res) ->
  Resource = mongoose.model('Country')
  if req.params.id?
    Resource.findByIdAndRemove req.params.id, (err, resource) ->
      #res.send({ error: err }) if err?
      res.send(resource)
  else if req.body.name?
    Resource.find().byName(req.body.name.toLowerCase()).remove (err, resource) ->
      #res.send({error: err}) if err?
      res.send(resource)

exports.retrieveAllNames = (req,res) ->
  Resource = mongoose.model('Country')
  Resource.find().select('name').sort('name').exec (err,coll)->
    #res.send({error : err}) if err?
    res.send(coll)

exports.isoAndRisk = (req,res) ->
  Resource = mongoose.model('Country')
  Resource.find().select('iso riskLevel name').exec (err,coll)->
    #res.send({error : err}) if err?
    res.send(coll)
