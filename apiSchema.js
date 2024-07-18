// apiSchema.js

const mongoose = require('mongoose');

const apiSchema = new mongoose.Schema({
    endpoint: {
        type: String,
        required: true
    },
    data: {
        type: Object,
        required: true
    }
});

module.exports = mongoose.model('Api', apiSchema);
