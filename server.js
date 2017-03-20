var express = require("express");
var mongo = require("mongodb").MongoClient;
var validUrl = require("valid-url");
var shortId = require("shortid");
var port = process.env.PORT || 8080;
var app = express();
app.use('/',express.static('public'));
app.get('/new/:url(*)',function(req,res){
    var url = req.params.url;
    if(validUrl.isUri(url)){
        mongo.connect(process.env.MONGOLAB_URI,function(err,db){
            if(err){
                res.end('MongoDB connection failure');
                return console.log(err);
            } else {
                var urlList = db.collection('urlList');
                var short = shortId.generate();
                urlList.insert([{url: url, short: short}],function(){
                    var data = {
                        original_url: url,
                        short_url: 'http://'+req.headers['host']+'/'+short
                    };
                    db.close();
                    res.send(data);
                });
            }
        });
    } else {
        var data = {
            error:'Empty data'
        };
        res.json(data);
    }
});
app.get('/:id',function(req,res){
  var id = req.params.id;
  mongo.connect(process.env.MONGOLAB_URI,function(err,db){
      if(err){
          return console.log(err);
      } else {
          var urlList = db.collection('urlList');
          urlList.find({short:id}).toArray(function(err,docs){
              if(err){
                  res.end('Error occured while looking for id');
                  return console.log('read',err);
              } else {
                    if(docs.length>0){
                        db.close();
                        res.redirect(docs[0].url);
                    } else {
                        db.close();
                        res.end('No such a shortlink in database');
                    }
              }
          });
      }
  });
});
app.listen(port,function(){
    console.log('everything is ok');
})