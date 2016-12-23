# Intelli

This App allows you to merge and transform data using different formats. For Example you can merge and format data from CSV file and MySQL database Simultaneously.

# Live Demo

  [https://letsconnect.co/intelli/] (https://letsconnect.co/intelli/)

# Features
- Material UI.
- Search for any hashtag.
- Search for multiple hashtags separated by space. (ex- custserv good)
- Drag and drop database.
- Select Primary Key.
- Export and download merged data into CSV or .SQL format
- Sentiment analysis of the tweets fetched [Powered by HPE- Heaven On Demand](http://www.havenondemand.com/).
- Debugging Mode

> NOTE: This is still under development few functionalities may not work.

### Dependencies

Intelli uses a number of open source projects to work properly:
- PHP running on a 64 bit machine
- Node(V 5.9.1) and NPM(v3.7.3) to build dependencies.
- [Browserify](http://browserify.org/) - Lets you require('modules') in the browser by bundling up all of your dependencies.
- [Watchify](https://www.npmjs.com/package/watchify) - Watch mode for browserify builds.

### Installation

- Download or clone this repo.
- Move it to your root directory.
- Although Bundle.js is given if you need to make some changes in app.js and generate new bundle.js, follow the steps below

From your terminal/cmd run, this will load all the dependencies  
```
$ npm install
```
To build bundle.js (Combines all JS into one.)
```
$ npm run build
```
Enable watch mode for browserify builds (Automatically builds, if there is any change in your JS files)
```
$ npm run watch
```
- Add your default database credentials in ``` app/model/sqlLogin.sample.php ``` and rename it to ```sqlLogin.php```




### Enable Debugging
- Pass debug=1 as parameter in URL to enable, and see useful error messages
- Pass debug=0 as parameter to disable debugging

#####Example
``` www.example.com?debug=1 ```

### Contact
If you have any doubts/queries please connect with me at [https://letsconnect.co](https://letsconnect.co)
