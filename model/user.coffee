mongoose=require 'mongoose'
bcrypt = require 'bcrypt-nodejs'


userSchema = new mongoose.Schema(
  local :{
    email:{
      type:String,
      trim:true,
      required: true,
      unique: true
    },
    password:{
      type: String,
      required: true
    },
    admin:{
      type: Boolean,
      default:false
    }
  }
)

userSchema.methods.generateHash = (password) ->
  bcrypt.hashSync password, bcrypt.genSaltSync(8), null

# checking if password is valid

userSchema.methods.validPassword = (password) ->
  bcrypt.compareSync password, @local.password

# create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema)
