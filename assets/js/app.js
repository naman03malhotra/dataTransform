
/*
 Require Basic Modules
*/
$ = jQuery = require('jquery');

/*
Nprogress loading bar
*/
var NProgress = require('NProgress');

/*
NPM module to convert plain tweet text to HTML
*/
var htmlTweet = require('html-tweet')()

var bootstrap = require('bootstrap');


/*
Get API key from HPE havenOnDemand
*/
var apikey = '9f610d60-d4ca-4047-b3f4-1d9ef15d2993';

/*
 To count the number of rows
*/
var counter = 0;

/*
To store HTML form of tweet
*/
var html_Tweet;

/*
To store text for sentiment analysis
*/
var textForSentiment;


/*
Maximum Number of attempts if request fails or hashtag not found
*/

var maxNumberOfAttempts=2;

/*
 temp variable to store max attemps
*/

var maxAttempts = maxNumberOfAttempts;


/*
To store processed text for sentimental analysis.
*/
var sentiText;

/*
Card template that will be appended
*/

var cardTemplate = '<div class="col-md-4">'+
                    '<div class="card text-center">'+
                      '<div class="card-content">'+
                          '<div class="card-image">'+
                                '<img class="img-circle user-img" src="" alt="Loading image...">'+
                                '<h5 class="card-image-headline">'+
                                '<span class="user-name"></span><br>'+
                                '<span class="badge"><span class="fa fa-retweet"></span>'+ 
                                '<span class="user-rt"></span></span> </h5>'+
                          '</div>'+
                          '<div class="card-body">'+                       
                          '</div>'+
                          '<footer class="card-footer">'+
                              '<a class="btn btn-block btn-primary card-footer-btn" role="button" onclick="">Analyze Sentiment</a>'+                        
                          '</footer>'+
                        '</div>'+
                    '</div>'+
                   '</div>';

 var collapseTemplate = '<div class="panel panel-default">'+
                          '<div class="panel-heading">'+
                            '<h4 class="panel-title">'+
                              '<a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#collapseOne">'+                               
                              '</a>'+
                            '</h4>'+
                          '</div>'+
                          '<div id="collapseOne" class="panel-collapse collapse">'+
                            '<div class="panel-body">'+
                            '</div>'+
                        '</div>'+
                      '</div>';

 var radioTemplate = '<div class="funkyradio-default">'+
                          '<input type="checkbox" name="radio" id="radio1" />'+
                          '<label class="radLabel" for="radio1"></label>'+
                        '</div>';


 
 /**
  * @param string text; Contains plain tweet text
  */

var processTextForSentiment = function(text) 

{
    sentiText = text;
    // removing special characters
    sentiText = sentiText.replace(/[^\w\s]/gi, "");
    //Removing new line. Windows would be \r\n but Linux just uses \n and Apple uses \r.
    sentiText = sentiText.replace(/(\r\n|\n|\r)/gm,"");    
    return sentiText;
}


/*
 * @param
 * Score takes result from sentiment result and converts to percentage upto two decimal places  
 */
var formatScore = function(score)
{
  return (score).toFixed(2);
}

/*
 * @param
 * score - takes result from sentiment result and converts to percentage upto two decimal places.
 * element - points to the element from which it is called.  
 */

var analyze_sentiment = function(text) 
{

    
        
      // create FormData
      var formData = new FormData();
      formData.append('text',text);
      formData.append('apikey',apikey);

      if (window.XMLHttpRequest)
          {
            xmlhttp = new XMLHttpRequest(); // code for IE7+, Firefox, Chrome, Opera, Safari
          }
        else
          {          
          xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); // code for IE6, IE5
          }
        xmlhttp.onreadystatechange = function()
          {
            if (xmlhttp.readyState == 1)
            {                
                         
            }
          else if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
            {             
                var response = JSON.parse(xmlhttp.responseText);   // converting JSON response from api to json object           
                
                var sentimentScore = formatScore(response.sentiment_analysis[0].aggregate.score);
                console.log('Sentiment Score: ' + sentimentScore);

                return sentimentScore;
            }
          }
        // send request  
        xmlhttp.open("POST","https://api.havenondemand.com/1/api/sync/analyzesentiment/v2",true);
        xmlhttp.send(formData);
}



 /**
  * function for fetching tweets
  *
  * @callback - requests callback
  * @param int            
  * mode = 1; call made from input i.e new hashtag is searched; resetting maxNumberOfAttempts 
  * mode = 0; call made from scrolling, no need to reset, work on same hashtag.
  */
var fetchTweets = function(callback,mode) 

{  
       
        // Picks value from hashtag input    
        var hashtag = $('#myhashtag').val();         

        // create FormData
        var formData = new FormData();
        formData.append('hashtag',hashtag);

        // resetting maxAttempts for a new search and appending mode with form data to reset MaxID (see fetchTweets.php)
        if(mode == 1)
            {
              formData.append('mode','1');
              maxAttempts = maxNumberOfAttempts;
            }
         

        if (window.XMLHttpRequest)
            {
              xmlhttp = new XMLHttpRequest(); // code for IE7+, Firefox, Chrome, Opera, Safari
            }
          else
            {
              xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); // code for IE6, IE5
            }

        xmlhttp.onreadystatechange = function()
          {
                if (xmlhttp.readyState == 1)
                {                                    
                   NProgress.start();  // Initiate loadingBar
                   NProgress.set(0.6);                                   
                }
              else if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
                {                                    
                    var response=JSON.parse(xmlhttp.responseText); // parsing JSON string obtained

                    if(response.query_status === false) //If request fails
                    {
                      alert('FATAL Error: '+response.error_msg); // alert msg
                      return;
                    }

                    if(response.mytweets.length == 0)  // Check if respose is empty
                    { 

                      // If Max attempts are exhausted and request is made for a new hashtag not by scroll.
                      if(maxAttempts-- <= 0 && mode != 0)    
                        {
                            // Display if no result is fetched for a tweet
                            $("#populate").html('<h1 class="text-center">No tweets found for this hashtag</h1>');                                   
                            NProgress.done();
                            return;
                        }
                      else  
                        fetchTweets(displayCardsTw); // Retry Until maxAttempts < 0 
                    }
                    else
                    {                                    
                        NProgress.set(0.8);
                        callback(response); // Fire Callback
                        NProgress.done();   // End Loading Bar
                    }   
                }
           }
        // Send Call only if Attempts are left.
        if(maxAttempts >= 0)  
          {
            xmlhttp.open("POST","fetch",true);
            xmlhttp.send(formData); // send hashtag and mode.
          }
          
  }


 /**
  * function for displaying tweets
  *
  * @param {json} tweets; contains tweets in json object           
  */
  

var displayCardsTw = function (tweets)

{  

    for(var i = 0;i < tweets.mytweets.length;i++) 
      {        
          
          var twitterId = tweets.mytweets[i].id;
          var tweetTxt = tweets.mytweets[i].text; //extracting tweet text
          var screenName = tweets.mytweets[i].screen_name; 
          textForSentiment = processTextForSentiment(tweetTxt);  // send tweet text to process for sentimental analysis

          var score = analyze_sentiment(textForSentiment);
          tweets.mytweets[i].sentimentScore = score;
      }
    console.log(tweets);
}
  


var fetchDb = function(callback,mode) 

{  
       
        // Picks value from hashtag input    
        var username = $('#username').val();      
        var password = $('#password').val(); 
        var portAndIp = $('#portAndIp').val();      

        // create FormData
        var formData = new FormData();
        formData.append('username',username);
        formData.append('password',password);
        formData.append('portAndIp',portAndIp);


       
         

        if (window.XMLHttpRequest)
            {
              xmlhttp = new XMLHttpRequest(); // code for IE7+, Firefox, Chrome, Opera, Safari
            }
          else
            {
              xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); // code for IE6, IE5
            }

        xmlhttp.onreadystatechange = function()
          {
                if (xmlhttp.readyState == 1)
                {                                    
                   NProgress.start();  // Initiate loadingBar
                   NProgress.set(0.6);                                   
                }
              else if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
                {                                    
                    var response=JSON.parse(xmlhttp.responseText); // parsing JSON string obtained

                    {                                    
                        NProgress.set(0.8);
                        callback(response); // Fire Callback
                        NProgress.done();   // End Loading Bar
                    }   
                }
           }
        
          {
            xmlhttp.open("POST","sqlLogin",true);
            xmlhttp.send(formData); // send hashtag and mode.
          }
          
  }


 /**
  * function for displaying tweets
  *
  * @param {json} tweets; contains tweets in json object           
  */
  

var displayCards = function (myData)

{  
    console.log(myData);
   for(var i = 0;i < myData.data.length;i++) 
      {        
          
          

          var colCard = $(collapseTemplate);
          var dbName = myData.data[i].Database; //extracting tweet text
         
          colCard.find('.accordion-toggle').attr("href","#dbLayer"+i);
          colCard.find('.accordion-toggle').html(' '+dbName);
          colCard.find('.panel-body').html('<div class="panel-group mysqlBind'+i+' text-left" id="accordion'+i+'"></div>');
          
          colCard.find('.panel-collapse').attr("id","dbLayer"+i);
                
          $(".mysqlBind").last().append(colCard);
          
          var count=0;
          while(myData.data[i][count]!=undefined)
          {
              var colCard2 = $(collapseTemplate);
              var tableName = myData.data[i][count].table;
              colCard2.find('.accordion-toggle').attr("href","#tbLayer"+i+'-'+count);
              colCard2.find('.accordion-toggle').attr("data-parent","#accordion"+i);
              colCard2.find('.accordion-toggle').html(' '+tableName);
              colCard2.find('.panel-body').html('<div class="funkyradio"></div>');
          
              colCard2.find('.panel-collapse').attr("id","tbLayer"+i+'-'+count);

              $(".mysqlBind"+i+"").last().append(colCard2);
              

              var count2=0;

                while(myData.data[i][count][count2]!=undefined)
                {
                    var radioCard = $(radioTemplate);
                    var fieldName = myData.data[i][count][count2];
                   

                    radioCard.find('#radio1').attr("id","fLayer"+i+'-'+count+'-'+count2);
                    radioCard.find('.radLabel').html(fieldName);                
                    radioCard.find('.radLabel').attr("for","fLayer"+i+'-'+count+'-'+count2);
                    radioCard.find('.radLabel').attr('onClick', 'set_primary_key(\''+fieldName+'\','+count+','+count2+')');


                    $(".funkyradio").last().append(radioCard);
                    count2++;                    
                }
                count++;
          }
      }

}
  
/*
  Fetch DB as soon as page loads

  $(document).ready(function() 
  {    
    fetchDb(displayCards);
  });
*/
/*
 Fetch DB when GO button is clicked
*/

  $("#goTrigger").click(function()
  {
    // When GO is clicked, i.e new hashtag is searched; empty #populate div  
    $(".mysqlBind").html('');
    fetchDb(displayCards,'1'); // send mode = 1, i.e New hashtag is searched.

  });

   
  $("#goTriggerTw").click(function()
  {
    // When GO is clicked, i.e new hashtag is searched; empty #populate div  
    $("#populate").html('');
    fetchTweets(displayCardsTw,'1'); // send mode = 1, i.e New hashtag is searched.

  });


/*
 Fetch Tweets if enter is pressed
*/

  $('#myhashtag').keydown(function(event)
  { 
        var keyCode = (event.keyCode ? event.keyCode : event.which);   
        if (keyCode == 13) 
        {
            $('#goTriggerTw').trigger('click');
        }
  });



/*
 Fetch Tweets if scrolled to bottom


$(window).scroll(function() 
{
    if ($(window).scrollTop() + $(window).height() == $(document).height()) 
    {
        // send mode = 0, stating call is made by scrolling down, i.e work on same hashtag
        fetchTweets(displayCards,'0');
    }
});

*/


$(document).ready(function(){
    $(".nav-tabs a").click(function(){
        $(this).tab('show');
    });
});



