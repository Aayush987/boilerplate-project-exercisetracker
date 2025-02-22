const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    log: [{
        description: {
            type: String,
        },
        duration: {
            type: Number,
            
        },
        date: {
            type: String,
            default: Date.now.toString(),
        },
    }],

})

module.exports = mongoose.model('User', userSchema);