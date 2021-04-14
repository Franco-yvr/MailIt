//unsubscribe from ses
exports.handler = (event, context, callback) => {
    // var body = JSON.parse(event.body);
    // var emailAddress = body.emailAddress;
    // console.log(body.dynamicValueStrings);
    // var dynamicValueStrings = body.dynamicValueStrings; // can we pass the key, value pair instead
    // //{ \"REPLACEMENT_TAG_NAME\":\"REPLACEMENT_VALUE\" }'
    // var tempalteId = body.templateId;

    
    
    // Load the AWS SDK for Node.js
    var aws = require('aws-sdk');
    var ses = new aws.SES({region: 'us-east-1'});
    var dynamodb = new aws.DynamoDB({apiVersion: '2012-08-10'});


            console.log("Parameters passed from unsubscribe link:",event.queryStringParameters);

    //queryStringParameters are parameters given in the url i.e. path/unsubscribe-from-ses?email="corbynkwan@gmail.com"
    const { email } = event.queryStringParameters;
    //console.log("email:",email)
 var params = {
  Identity: email
 };
    var unsubscribeSesResponse = new Promise(function(resolve, reject) {
         ses.deleteIdentity(params, function(err, data) {
           if (err) {
               console.log("Unsubscribe from SES Error:", err.stack); 
               reject( err);
           } else {
               console.log("Unsubscribe from SES Success:",data); 
               resolve(data);
           }
         });
    });
     var itemParams = {
      Item: {
       "email": email
      }, 
      ReturnConsumedCapacity: "TOTAL", 
      TableName: "unsubcribed_emails"
     };
    var putItemResponse = new Promise(function(resolve, reject) {
         dynamodb.putItem(itemParams, function(err, data) {
           if (err) {
               console.log("Put Item to Unsubscribe Email log Error",err, err.stack); 
               reject( err);
           } else {
               console.log("Put Item to Unsubscribe Email log Success",data); 
               resolve(data);
           }
         });
    });

    unsubscribeSesResponse.then(data => {
        putItemResponse.then(data => {
        
        var response = {
            "statusCode": 200,
            "body": "Email Unsubscribed Successfully" + JSON.stringify(event)
        };
        callback(null, response);
        
    });
    }).catch( error => {
        var response = {
            "statusCode": 500,
            "body": JSON.stringify(error)
        };
        callback(null, response);
    });
};
