const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique:true,
    },
    password: {
        type: String,
        required: true,
    },
    pic: {
        type: String,
      //  required: true,
        default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },

},
    {
        timestamps: true,
    },
    
);

userSchema.methods.matchPassword = async function (enteredPassword) {
//for verify
    return await bcrypt.compare(enteredPassword,this.password)
    
}
//so what these will do before saving user to our DB its gonna encrypt the password
//before saving we should add function here 
userSchema.pre("save", async function (next) {
    if (!this.isModified)//current password is not modified move on to the next one...dont run the code after it
    {
        next()
    } 
    //generate new passsword
    const salt = await bcrypt.genSalt(10);//most strong salt will be created
    this.password=await bcrypt.hash(this.password,salt)
})

const User = mongoose.model("User", userSchema);

module.exports = User;