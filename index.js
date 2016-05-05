var http = require('http');
var express = require('express');
var bodyParser = require("body-parser");
var fs = require("fs");
var fileUpload = require('express-fileupload');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var app  = express();
var port =process.env.PORT|| 8080;

//Create a server
var server = http.createServer(app);
var chat = require("./server_modules/chat.js")(server);
var database = require("./server_modules/database.js")();

//Emial service setup
var options = {
    service: 'gmail',
    auth: {
        user: 'mdq.hoteles',
        pass: "mdqadmin"
    }
  };
var transporter = nodemailer.createTransport(smtpTransport(options));

app.use(bodyParser());
//File uploading capabilities
app.use(fileUpload());

app.use("/", express.static(__dirname + "/"));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/views/home.html');
});

app.get('/client-admin', function(req, res){
	res.sendFile(__dirname + '/views/client-admin.html');
});

app.get('/center-admin', function(req, res){
	res.sendFile(__dirname + '/views/center-admin.html');
});

app.get('/center', function(req, res){
	res.sendFile(__dirname + '/views/center.html');
});

app.get('/mdqhotels', function(req, res){
	res.sendFile(__dirname + '/views/mdqhotels.html');
});

app.get('/client/:client_id', function(req, res){
	database.getClients({"web_url" : req.params.client_id}, function(docs){
		if (!docs.length){
			res.sendFile(__dirname + '/views/error.html');
		}
		else{
        if (docs[0].enabled){
          res.sendFile(__dirname + '/views/client.html');
        }
        else{
          res.sendFile(__dirname + '/views/paypal.html');
        }
		}
	});
});

//Database calls
app.get('/getClients', function(req, res){
	database.getClients(JSON.parse(req.query.query), function(docs){
		res.writeHead("200");
		res.write(JSON.stringify(docs));
		res.end();
	});
});

app.post('/addClient', function(req, res){
	database.addClient(req.body.client, function(){
			res.end();
	});
});

app.post('/updateClientPage', function(req, res){
	database.updateClientPage(req.body.client,req.body.data, function(){
			res.end();
	});
});

app.post('/updateClientEnabled', function(req, res){
  database.updateClientEnabled(req.body.client,req.body.data, function(){
			res.end();
	});
});

app.post('/uploadImage', function(req, res){
	var sampleFile;
	if (!req.files) {
		res.send('No files were uploaded.');
		return;
	}
	file = req.files.file;
	var newname = req.body.newname;
	fs.readFile(file.name, function(err, data) {
	  var path = __dirname + req.body.serverpath + newname;
		fs.writeFile(path, file.data, "base64", function(err) {
			if (err){console.log("WRITE ERROR!");};
			res.end();
		});
	});
});

//HTTP to send email to client
app.get('/sendEmail', function(req, res){
	// create reusable transporter object using the default SMTP transport

	// setup e-mail data with unicode symbols
	var mailOptions = {
	    to: req.query.email, // list of receivers
	    subject: 'SOLICITUD RESERVA HotelMDQ', // Subject line
	    html: ""
	};
	if (req.query.dni==""){
		req.query.dni= "(No provisto)";
	}
	var mailBody= "<h3> Hemos procesado una solicitud con los siguientes datos: </h3>"+"<p><b>Usuario: </b>"+req.query.username+"</p>"+"<p><b>Mail: </b>"+req.query.email+"</p>"+"<p><b>Teléfono: </b>"+req.query.phone+"</p>"+"<p><b>DNI: </b>"+req.query.dni+"</p>"+"<p><b>Fecha de llegada: </b>"+req.query.arrivalDate+"</p>"+"<p><b>Fecha de partida: </b>"+req.query.leavingDate+"</p>"+"<p><b>Cantidad de personas: </b>"+req.query.people+"</p>";
	mailBody +="<h3> Los siguientes hoteles han sido seleccionados: </h3>";
	if (Array.isArray(req.query.hotels)){
		for (i in req.query.hotels){
			var hotel= JSON.parse(req.query.hotels[i]);
			mailBody+="<p>"+hotel.name+"</p>";
		}
	}
	else{
		var hotel= JSON.parse(req.query.hotels);
		mailBody+="<p>"+hotel.name+"</p>";
	}

	var specialArray=[];
	if (Array.isArray(req.query.specialRooms)){
		for (k in req.query.specialRooms){
			specialArray.push(JSON.parse(req.query.specialRooms[k]));
		}
	}
	else if (typeof(req.query.specialRooms)!='undefined'){
		console.log(req.query.specialRooms);
		specialArray.push(JSON.parse(req.query.specialRooms));
	}
	if (specialArray.length>0){
		mailBody +="<h3> Se han especificado los siguientes datos sobre las habitaciones: </h3>";
		for (i in specialArray){
			mailBody+="<p> Habitación "+ i +". Adultos: "+specialArray[i].adults+". Niños: "+specialArray[i].kids+". Edades de los niños:</p>";
			for (j in specialArray[i].kids_ages){
				var obj=specialArray[i].kids_ages[j];
				mailBody+="<p> Niño "+j+": "+obj.age+ " años. </p>";
			}
		}
	}
	mailOptions.html=mailBody;

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, response){
			if(error){
				res.end('{"success" : "Sent Successfully", "status" : 200}');
			}else{
				res.end('{"error" : "Email error", "status" : 200}');
			}
		});
});

//Lets start our server
server.listen(port, function(){
    //Callback triggered when server is successfully listening. Hurray!
		chat.listen();
    console.log("Server listening on: http://localhost:%s", port);
});
