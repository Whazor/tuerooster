var casper = require('casper').create({
    verbose: true,
    logLevel: 'debug',
    onResourceReceived: function(resource) {
      // console.log(resource);
    }
});
var fs = require('fs');

var username = casper.cli.args[0];
var password = casper.cli.args[1];

var isStarted = false;
var file = 0;

casper.on('resource.requested', function (resource) {
  if(isStarted) return;
  if(resource.url.indexOf("ExportToOutlook") > -1){
    isStarted = true;
    this.download(resource.url, "rooster-"+username+'-'+(file++), "GET");
    isStarted = false;
  }
})

casper.start('https://onderwijssso.tue.nl/Activiteiten/Pages/TimeTable.aspx?mode=jaar').waitForSelector('#logonForm', function() {
    this.fill('form#logonForm', { username: username, password: password }, true);
}).waitForText('Persoonlijk rooster', function() {
    this.click({
        type: 'xpath',
        path: "//input[contains(@id,'btnExport')]"
    });
}).wait(5000, function() {
  this.click({
      type: 'xpath',
      path: "//input[contains(@id,'btnNextTimeTable')]"
  });
}).wait(1000, function() {
  this.click({
      type: 'xpath',
      path: "//input[contains(@id,'btnExport')]"
  });
}).wait(5000);
casper.run();
