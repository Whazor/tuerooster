var express = require('express');
var app = express();
var fs = require('fs');

var path = require('path');
var childProcess = require('child_process');
var ICalParser = require('cozy-ical').ICalParser;

app.get('/', function(req, res){
  res.sendFile(__dirname+'/index.html');
});


app.get('/rooster', function(req, res){
  var username = req.query.username;
  var password = req.query.password;
  if(username == null || password == null) {
    console.log("missing username or password");
  }

  if(username[0] != 's') console.log("incorrect username");


  var childArgs = [
    path.join(__dirname, 'fetch.js'), username, password
  ]

  childProcess.execFile("casperjs", childArgs, function(err, stdout, stderr) {
    // handle results
    fs.readFile('rooster-'+username+'-0', 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }

      data = data.replace(/DTSTART/g, 'DTSTART;TZID=Europe/Amsterdam');
      data = data.replace(/DTSTAMP/g, "DTSTAMP;TZID=Europe/Amsterdam");
      data = data.replace(/DTEND/g, "DTEND;TZID=Europe/Amsterdam");

      var parser = new ICalParser();
      parser.parseString(data, function(err, cal) {
        fs.readFile('rooster-'+username+'-1', 'utf8', function (err,data) {
          if (err) {
            return console.log(err);
          }

          data = data.replace(/DTSTART/g, 'DTSTART;TZID=Europe/Amsterdam');
          data = data.replace(/DTSTAMP/g, "DTSTAMP;TZID=Europe/Amsterdam");
          data = data.replace(/DTEND/g, "DTEND;TZID=Europe/Amsterdam");

          parser.parseString(data, function(err, cal2) {
            var array = cal2.subComponents;
            for (var i = 0; i < cal2.subComponents.length; i++) {
              cal.add(cal2.subComponents[i])
            }
            res.send(cal.toString())
          });
        });
      });
    });

  });
});


/* Use PORT environment variable if it exists */
var port = process.env.PORT || 5000;
server = app.listen(port);

process.on( "SIGINT", function() {
  console.log('CLOSING [SIGINT]');
  process.exit();
} );

process.on( "SIGTERM", function() {
  console.log('CLOSING [SIGTERM]');
  process.exit();
} );

console.log('Server listening on port %d in %s mode', server.address().port, app.settings.env);
