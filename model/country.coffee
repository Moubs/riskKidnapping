mongoose = require 'mongoose'

Country = new mongoose.Schema(
  iso:{
    type: String
  },
  name: {
    type: String,
    required: true,
    lowercase: true,
    unique: true
  },
  currency: [String],
  riskLevel:{
    type: Number
  },
  riskDescription: [String],
  advice: [String],
  url:{
    type: String
  }
)

Country.query.byName = (name) ->
  return this.find({name: name})

mongoose.model "Country", Country
