var request     = require("request");
var cheerio     = require("cheerio");
var csvWriter   = require("csvwriter");
var fs          = require("fs");

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
	                	// I would like to include an - if the file searchEngine+'.csv'
	                	// doesn't exist then create it
	                    fs.writeFile(searchEngine+".csv",csv, function(){
	                    	console.log('Wrote to:',searchEngine);
	                    });
	                })
	            }
	        }
        })
    });
}

var googleScraper = function(searchTerm){
    var linkArray = [];
	request("https://www.google.com/search?q="+searchTerm, function(err, res, body){
        linkArray = [];
        if (err) {
          console.log(err);
        } else if (res.statusCode !== 200) {
          console.log("unexpected error code:"+res.statusCode);
        } else {
            var $ = cheerio.load(body);
            $('h3.r a').each(function(i, element){
              var linkClean = $(element).attr('href').match('(?=http|https).*(?=&sa)')
              if (linkClean !== null) {
                  if (linkArray.length < 6){
                    linkArray.push(linkClean[0]);
                  } else { return false }
              }
            });
        }
        titleScraper("google",linkArray);
    });
}

var bingScraper = function(searchTerm){
    var linkArray = [];
	request("http://www.bing.com/search?q="+searchTerm, function(err, res, body){
        linkArray = [];
        if (err) {
          console.log(err);
        } else if (res.statusCode !== 200) {
          console.log("unexpected error code:"+res.statusCode);
        } else {
            var $ = cheerio.load(body);
            $('li.b_algo h2 a').each(function(i, element){
              var linkClean = $(element).attr('href').match('(?=http|https)')
              if (linkClean['input'] !== null) {
                  if (linkArray.length < 6){
                    linkArray.push(linkClean['input']);
                  } else { return false }
              }
            });
        }
        titleScraper("bing",linkArray);
    });
}

console.log("Hi there! Let's do some scraping!");
if(process.argv.length == 3 && typeof process.argv[2] === 'string'){
    googleScraper(process.argv[2]);
    bingScraper(process.argv[2]);
} else {
    console.log("This script expects one non-empty string as an argument!")   
}



// I like the solution below a lot more. Writing a search function for every
// engine is not preferable.
// The main reason I haven't gone with the solution below is because of the
// matchArg part.
// When trying to use it to match, it returns no results. I tested in console
// log and can't see quite why it's not acting the way I expect.

// var request     = require("request");
// var cheerio     = require("cheerio");
// var csvWriter   = require("csvwriter");
// var fs          = require("fs");

// var titleScraper = function(searchEngine, linksArray){
//     var titleArray = [];
//     linksArray.forEach(function(link, i){
//         request(link, function(err, res, body){
//             var $ = cheerio.load(body);
//             if ($('title').text() !== null){
// 	            titleArray.push($('title').text());
// 	            // I don't like this if... feels bad but it works
// 	            if (titleArray[5] === $('title').text()){
// 					var linkTitles = titleArray.map(function (e, i) {
// 					    return ['url: '+linksArray[i]+' ',' title: '+titleArray[i]];
// 					});
// 	                csvWriter(linkTitles, function(err, csv){
// 	                	// I would like to include an - if the file searchEngine+'.csv'
// 	                	// doesn't exist then create it
// 	                    fs.writeFile(searchEngine+".csv",csv, function(){
// 	                    	console.log('Wrote to:',searchEngine);
// 	                    });
// 	                })
// 	            }
// 	        }
//         })
//     });
// }

// var searchEngineParams = {
//     google:{
//         url:"https://www.google.com/search?q=",
//         pathToLink:"h3.r a",
//         matchArg:"'(?=http|https).*(?=&sa)'"
//     },
//     bing:{
//         url:"http://www.bing.com/search?q=",
//         pathToLink:"li.b_algo h2 a",
//         matchArg:"'(?=http|https)'"
//     }
// }

// var mainScraper = function(searchEngine, searchTerm){
//     if(searchEngineParams[searchEngine] !== undefined){
//         var engineOptions = searchEngineParams[searchEngine];
//     } else {
//         console.log("Invalid search engine name -",searchEngine);
//     }
//     var linkArray = [];
// 	request(engineOptions['url']+searchTerm, function(err, res, body){
//         linkArray = [];
//         if (err) {
//             console.log(err);
//         } else if (res.statusCode !== 200) {
//             console.log("unexpected error code:"+res.statusCode);
//         } else {
//             var $ = cheerio.load(body);
//             $(engineOptions['pathToLink']).each(function(i, element){
//                 var linkClean = $(element).attr('href').match('(?=http|https).*(?=&sa)')
//                 console.log(linkClean)
//                 if (linkClean !== null) {
//                     if (linkArray.length < 6){
//                         linkArray.push(linkClean[0]);
//                     } else { return false }
//                 }
//             });
//         }
//         titleScraper(searchEngine,linkArray);
//     });
// }

// console.log("Hi there! Let's do some scraping!");
// if(process.argv.length == 3){
//     mainScraper("google",process.argv[2]);
//     mainScraper("bing",process.argv[2]);
// } else {
//     console.log("This script expects one argument!")   
// }