mongoose = require 'mongoose'

Country = new mongoose.Schema(
  iso:{
    type: String
  }
  name: {
    type: String,
    required: true,
    lowercase: true,
    unique: true
  }
  riskLevel:{
    type: Number
  }
  riskDescription:{
    type: String
  }
  advice:{
    type: String
  }
  url:{
    type: String
  }
)

Country.query.byName = (name) ->
  return this.find({name: name})

mongoose.model "Country", Country
