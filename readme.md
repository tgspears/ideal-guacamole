##This is a node challenge!

###This script should:

1. In NodeJS, please write a script that takes a keyword as an argument from the command line.
2. The script would then search Google and Bing for the keyword.
3. The script will visit the top 6 search results from both Google and Bing.
4. On each visited page from the search results list, scrape the <title> element.
5. Store the url for the visited page and the contents of the <title> element in a CSV file.
6. In the end there should be two CSV files output:  one for the Google results and one for Bing.

To execute the script, run: node main.js *searchTerm*

I have also included the ability to store search engine specific information needed to scrape from them in an object defined at the top of the main.js file. I'd like to build off of that to scrape more sites (duckduckgo, symbolhound, askjeeves (because I recently discovered that's still around), yahoo, etc).

I would also like to bring in more user interaction through prompts like after executing the code, in stead of needing to input the search term when executing, have the script prompt the user for the search term, list compatible engines and ask which engine to use and to allow multiple scrapes in one execution (In the case of multiple scrapes I would also want to build in some naming convention for each subsequent scrape so each scrape doesn't just overwrite the csv for that engine).