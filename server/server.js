var express = require('express'),
	morgan = require('morgan'),
	path = require('path'),
	colors = require('colors'),
	datastore = require('docstore'),
	bodyParser = require('body-parser');

var userDb, ideasDb;

datastore.open('./server/datastore/users', function(err, store) {
	if (err) {
		console.log(err);
	}
	else {
		userDb = store;
	}
});

datastore.open('./server/datastore/ideas', function(err, store) {
	if (err) {
		console.log(err);
	}
	else {
		ideasDb = store;
	}
});

var app = express();


app.use(morgan(':remote-addr - ' + 
			   '[:date] '.cyan + 
			   '":method :url '.green + 
			   'HTTP/:http-version" '.gray + 
			   ':status '.yellow + 
			   ':res[content-length] ' + 
			   '":referrer" ":user-agent" '.gray + 
			   'time=:response-time ms'
));
app.use(express.static(path.join(__dirname + '/../src')));
app.use(bodyParser.json());


app.post('/login', function(req, res) {
	//console.log(req.body);
	userDb.get(req.body.username, function(err, doc) {
		if (err) {
			res.status(200).send('USER_NOT_FOUND');
		}
		else {
			var accountFromDb = JSON.parse(doc.jsonStr);
			if (req.body.password === accountFromDb.password) {
				res.status(200).send('AUTH_OK');
			}
			else {
				res.status(200).send('AUTH_ERROR');
			}
		}
	});
});
app.post('/signup', function(req, res) {
	//console.log(req.body);
	saveToDatastore(req.body.username, req.body, userDb);
	res.sendStatus(201);
});
app.post('/idea', function(req, res) {
	//console.log(req.body);
	saveToDatastore(req.body.id, req.body, ideasDb);
	res.sendStatus(201);
});

app.get('/idea', function(req, res) {
	ideasDb.get(req.body.id, function(err, doc) {
		if (err) {
			res.status(200).send('IDEA_NOT_FOUND');
		}
		else {
			res.status(200).json(JSON.parse(doc.jsonStr));
		}
	});
});


app.listen(process.argv[2] || 8080);


saveToDatastore = function(key, value, datastore, logOnlyErrors) {
	datastore.save(
	{
		key: key,
		_id: key,
		jsonStr: JSON.stringify(value)
	}, 
	function(err, doc) {
		if (err) {
			console.log(err);
		}
		else if (!logOnlyErrors) {
			console.log('Document with key ' + doc.key + ' stored.');
		}
	});
};