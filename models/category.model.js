const mongoose = require('mongoose');
const categorytSchema = mongoose.Schema({
name:{
    type: String,
    required: true
},
icon: {
    type: String
},
color:{
    type: String
}
});

categorytSchema.virtual('id').get(function(){
    return this._id.toHexString();
});


categorytSchema.set('toJSON', {
    virtuals: true,
});
exports.Category = mongoose.model('Category', categorytSchema);