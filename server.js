var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var fs = require('fs');

var port = 3000;
var app = express();
var dataFileName = 'data.json';
var data;
var defaultSettings = {
	dateFormatStr: 'dddd, MMMM Do YYYY, h:mm:ss.SS a'
};

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(logger({format: 'dev'}));
app.use(express.static(__dirname + '/public')); // serve public files


// get data
if (fs.existsSync(dataFileName))
	data = JSON.parse(fs.readFileSync('data.json').toString());
else
	data = {entries: []};

if (!data.settings) {
	data.settings = defaultSettings;
}

// routes
app.get('/', function (req, res) {
	res.sendfile('index.html');
});

app.get('/entries', function (req, res) {
	res.json(data);
});

app.post('/send', function (req, res) {
	var entry = req.body;
	entry.timestamp = new Date().getTime();
	if (entry.tagStr) {
		var tags = entry.tagStr.split(',')
			.map(function (tag) { return tag.trim()})
			.filter(function (tag) { return tag !== ''});
		delete entry.tagStr;
		entry.tags = tags;
	}
	data.entries.push(entry);
	writeData();
	res.json(entry);
});

app.post('/search', function (req, res) {
	var searchObj = req.body;
	if (searchObj.searchTags) {
		searchObj.tags = searchObj.searchTags.split(',').map(function (searchTag) {
			return searchTag.trim();
		}).filter(function (searchTag) {
			return searchTag !== '';
		});
	}

	var entries = data.entries.filter(function (entry) {
		var textMatch, tagMatch;
		if (searchObj.searchText) {
			textMatch = entry.text.indexOf(searchObj.searchText) >= 0;
		}
		if (searchObj.tags !== undefined && entry.tags !== undefined) {
			tagMatch = entry.tags.some(function (tag) {
				return searchObj.tags.some(function (searchTag) {
					return searchTag === tag;
				});
			});
		}
		return textMatch || tagMatch;
	});

	res.json({entries: entries});
});

var writeData = function () {
	fs.writeFile(dataFileName, JSON.stringify(data), function (err) {
		if (err)
			console.log("couldn't write file...");
	});
};

app.listen(port);
console.log('server listening on port:', port.toString());