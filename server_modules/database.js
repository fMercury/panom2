module.exports = function () {
    var module = {};

    var mongoose = require('mongoose');
    var schemas = require("./schemas.js")(mongoose);
    //Connect to database
    mongoose.connect('mongodb://center-admin:centeradmin@ds015720.mlab.com:15720/shopping-centers');

    module.getClients = function(query, callback){
      //docs will be an array
      schemas.clientModel.find(query, function(err, docs){
        if (err){
          console.log("Error obtieniendo clientes.");
        }
        else{
          callback(docs);
        }
      });
    };

    module.addClient = function(client, callback){
      //docs will be an array
      var newClient = schemas.clientModel(client);
      newClient.save(function (err) {
        if (err){
          console.log("Error guardando cliente.");
        }
        else{
          callback();
        }
      });
    };

    module.updateClientPage = function(clientName,data, callback){
      //docs will be an array
      var client = schemas.clientModel();
      schemas.clientModel.update({"name" : clientName}, {"page_content": data}, function (err) {
        if (err){
          console.log("Error guardando cliente.");
        }
        else{
          callback();
        }
      });
    };

    module.updateClientEnabled = function(clientName,data, callback){
      //docs will be an array
      var client = schemas.clientModel();
      schemas.clientModel.update({"name" : clientName}, {"enabled": data}, function (err) {
        if (err){
          console.log("Error guardando cliente.");
        }
        else{
          callback();
        }
      });
    };

    return module;
}
