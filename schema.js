var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

// Counter Schema
var CounterSchema = Schema({
  _id: {type: String, required: true},
  seq: { type: Number, default: 0 }
});
var counters = mongoose.model('counters', CounterSchema);

// URL List Schema
var URLSchema = new Schema({
  id: { type: Number, default: 0 },
  url: String
});

// Increment the id of the URL for each new URL
URLSchema.pre('save', function(next) {
  var doc = this;
  counters.findByIdAndUpdate({_id: 'urlid'}, {$inc: { seq: 1} }, function(error, counters)   {
    if(error)
      return console.log(counters); next(error);
    doc.id = counters.seq;
    next();
  });
});


module.exports = mongoose.model('UrlList', URLSchema);