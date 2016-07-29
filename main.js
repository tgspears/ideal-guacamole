var request     = require("request");
var cheerio     = require("cheerio");
var csvWriter   = require("csvwriter");
var fs          = require("fs");

var searchEngineParams = {
    google: {
        url:"https://www.google.com/search?q=",
        pathToLink:"h3.r a",
        matchArg:"(?=http|https).*(?=&sa)"
    },
    bing: {
        url:"http://www.bing.com/search?q=",
        pathToLink:"li.b_algo h2 a",
        matchArg:"(?=http|https).*"
    }
    // duck:{
    //  url:"https://duckduckgo.com/?q=",
    //  pathToLink:"",
    // matchArg:"(?=http|https).*"
    // }
}

var titleScraper = function(searchEngine, linksArray){
    var titleArray = [];
    linksArray.forEach(function(link, i){
        request(link, function(err, res, body){
            var $ = cheerio.load(body);
            if ($('title').text()){
                titleArray.push($('title').text());
                if (titleArray.length === linksArray.length){
                    var linkTitles = titleArray.map(function (title, i) {
                        return ['url: '+linksArray[i]+' => title: '+title];
                    });
                    csvWriter(linkTitles, function(err, csv){
                        fs.writeFile(searchEngine+".csv", csv, { flag: 'w' }, function(err){
                            if (err) {
                                console.log(err);
                                return false;
                            } else {
                                console.log('Wrote to:', searchEngine);
                                return false;
                            }
                        });
                    });
                }
            }
        });
    });
}

var mainScraper = function(searchEngine, searchTerm){
    if(searchEngineParams[searchEngine]){
        var engineParams = searchEngineParams[searchEngine];
    } else { console.log("Invalid search engine name -",searchEngine); }
    var linkArray = [];
    request(engineParams['url']+searchTerm, function(err, res, body){
        if (err) {
            console.log(err);
            return false;
        } else if (res.statusCode !== 200) {
            console.log("unexpected error code:",res.statusCode);
            return false;
        } else {
            var $ = cheerio.load(body);
            $(engineParams['pathToLink']).each(function(i, element){
                var linkClean = $(element).attr('href').match(engineParams["matchArg"]);
                if (linkClean !== null) {
                    if (linkArray.length < 6){
                        linkArray.push(linkClean[0]);
                    } else { return false }
                }
            });
        }
        if(linkArray.length > 0){
            titleScraper(searchEngine,linkArray);
        } else {
            console.log('You broke the internet!',searchEngine,'yielded no valid results!');
        }
    });
}

if(process.argv.length == 3){
    console.log("Hi there! Let's do some scraping!");
    for(var engine in searchEngineParams){
        mainScraper(engine,process.argv[2]);
    }
} else {
    console.log("This script expects one argument!");
}