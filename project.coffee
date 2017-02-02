express = require 'express'
mongoose = require 'mongoose'
bodyParser = require 'body-parser'
fs = require 'fs'

path = require 'path'


app = express()

app.set "port", 8080
app.set 'storage-uri'

app.use bodyParser.json()



storage_uri =   process.env.MONGOHQ_URL or
  process.env.MONGOLAB_URI or
  'mongodb://localhost/riskKidnapping'

mongoose.Promise = global.Promise
connection = mongoose.connect storage_uri,{
  db:{safe:true}
  },(err)->
    if err?
      console.log "Mongoose - connection error:" + err
    else
      console.log "Mongoose - connection OK"


require './model/country'
country = require './controller/countryCtrl'

countries = JSON.parse(fs.readFileSync("countries.json"))

for c in countries
  count = {}
  count.name=c.translations.fra.common
  count.iso=c.cca3
  req = {
    body: count,
    params:{}
  }
  country.save req

app.get '/' , (req,res) ->
  res.sendFile path.join __dirname+'/public/views/index.html'

app.get '/map', (req,res) ->
  res.sendFile path.join __dirname+'/public/views/map.html'


app.post '/saveCountry', country.save

app.post '/getCountry', country.retrieve

app.get '/allCountryName', country.retrieveAllNames

app.get '/getISOandRisk', country.isoAndRisk

app.use '/static', express.static(__dirname+'/public')
app.use '/static', express.static(__dirname+'/node_modules')


app.listen app.get('port')
