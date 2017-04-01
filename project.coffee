express = require 'express'
mongoose = require 'mongoose'
bodyParser = require 'body-parser'
passport = require 'passport'
session = require 'express-session'
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

require('./controller/passport')(passport)

require './model/country'
country = require './controller/countryCtrl'
users = require './controller/usersCtrl'

require './model/user'


app.use session({secret:'moubilesmeilleurs', name:'session',
cookie:{
  maxAge : 36000000
  }})
app.use passport.initialize()
app.use passport.session()


countries = JSON.parse(fs.readFileSync("countries.json"))
currency = JSON.parse(fs.readFileSync("currencymap.json"))

for c in countries
  count = {}
  count.name=c.translations.fra.common
  count.iso=c.cca3
  count.currency=[]
  for m in c.currency
    if currency[m]?
      count.currency.push(currency[m].symbol)
    else
      count.currency.push(m)
  req = {
    body: count,
    params:{}
  }
  country.save req



isAdmin = (req, res, next) ->
  users.isAdmin(req,res)
  if (req.session.isAdmin)
    return next()

isAuth = (req, res, next) ->
  if (req.session.isLog)
    return next()
  else
    res.status(406).send()

saveLog = (req, res) ->
  req.session.isLog = true
  res.send req.body.email

app.get '/' , (req,res) ->
  req.session.reload( () ->
    )
  res.sendFile path.join __dirname+'/public/views/index.html'


app.post '/saveCountry', isAuth, isAdmin, country.save

app.post '/getCountry', isAuth, country.retrieve

app.get '/allCountryName', isAuth, country.retrieveAllNames

app.get '/getISOandRisk', isAuth, country.isoAndRisk

app.get '/getUsers', isAuth, isAdmin, users.GetAllUsers

app.post '/grantAdmin', isAuth, isAdmin, users.grantAdmin

app.use '/static', express.static(__dirname+'/public')
app.use '/static', express.static(__dirname+'/node_modules')

app.get '/isLog', (req,res) ->
  if(req.session.isLog?)
    res.send(true)
  else
    res.send(false)

app.get '/isAdmin', (req,res) ->
  users.isAdmin(req,res)
  if(req.session.isAdmin)
    res.send(true)
  else
    res.send(false)

app.get '/logout', (req,res) ->
  req.session.destroy()
  res.send({})

app.post '/register', ((req, res, next) ->
  passport.authenticate('local-signup', (err, user, info) ->
    if err
      return res.status(406).send({error : err})
    if !user
      return res.status(406).send(info)
    req.logIn user, (err) ->
      if err
        return res.status(406).send({error : err})
      return next()
  ) req, res, next) , saveLog

app.post '/login', ((req, res, next) ->
  passport.authenticate('local-login', (err, user, info) ->
    if err
      return res.status(406).send({error : err})
    if !user
      return res.status(406).send(info)
    req.logIn user, (err) ->
      if err
        return res.status(406).send({error : err})
      if(user.local.admin)
        req.session.isAdmin = true
    return next()
  ) req, res, next ), saveLog


app.listen app.get('port')
