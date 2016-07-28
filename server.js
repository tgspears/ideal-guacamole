var request     = require("request");
var cheerio     = require("cheerio");
var csvWriter   = require("csvwriter");
var fs          = require("fs");

var searchEngineParams = {
    google:{
        url:"https://www.google.com/search?q=",
        pathToLink:"h3.r a",
        matchArg:"(?=http|https).*(?=&sa)"
    },
    bing:{
        url:"http://www.bing.com/search?q=",
        pathToLink:"li.b_algo h2 a",
        matchArg:"(?=http|https).*"
    }
    // duck:{
    // 	url:"https://duckduckgo.com/?q=",
    // 	pathToLink:"",
    // matchArg:"(?=http|https).*"
    // }
}

var titleScraper = function(searchEngine, linksArray){
    var titleArray = [];
    linksArray.forEach(function(link, i){
        request(link, function(err, res, body){
            var $ = cheerio.load(body);
            if ($('title').text() !== null){
	            titleArray.push($('title').text());
	            // I don't like this if... feels bad but it works
	            if (titleArray[5] === $('title').text()){
					var linkTitles = titleArray.map(function (e, i) {
					    return ['url: '+linksArray[i]+' ',' title: '+titleArray[i]];
					});
	                csvWriter(linkTitles, function(err, csv){
	                    fs.writeFile(searchEngine+".csv",csv, { flag: 'w' }, function(err){
	                    	if (err) throw err;
	                    	console.log('Wrote to:',searchEngine);
	                    });
	                });
	            }
	        }
        });
    });
}

var mainScraper = function(searchEngine, searchTerm){
    if(searchEngineParams[searchEngine] !== undefined){
        var engineOptions = searchEngineParams[searchEngine];
    } else {
        console.log("Invalid search engine name -",searchEngine);
    }
    var linkArray = [];
	request(engineOptions['url']+searchTerm, function(err, res, body){
        linkArray = [];
        if (err) {
            console.log(err);
        } else if (res.statusCode !== 200) {
            console.log("unexpected error code:"+res.statusCode);
        } else {
            var $ = cheerio.load(body);
            $(engineOptions['pathToLink']).each(function(i, element){
                var linkClean = $(element).attr('href').match(engineOptions["matchArg"]);
                if (linkClean !== null) {
                    if (linkArray.length < 6){
                        linkArray.push(linkClean[0]);
                    } else { return false }
                }
            });
        }
        titleScraper(searchEngine,linkArray);
    });
}

console.log("Hi there! Let's do some scraping!");
if(process.argv.length == 3){
    for(var engine in searchEngineParams){
    	mainScraper(engine,process.argv[2]);
    }
} else {
    console.log("This script expects one argument!")   
}