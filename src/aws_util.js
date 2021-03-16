import AWS from 'aws-sdk'
import axios from 'axios'
import fs from 'fs'
import { type } from 'os';

const uploadFile = async (fileInput,BUCKET_NAME) => {
    console.log(fileInput);
    if(typeof(fileInput) !== 'object' || !(fileInput instanceof File)) {
        
        throw Error("File input is not of type File");
    }

    if((typeof(BUCKET_NAME)) !== "string" || BUCKET_NAME == null) {
        throw Error("Bucket name is not a string");
    }

    if(BUCKET_NAME === "") {
        throw Error("Bucket name cannot be an empty string");
    }
    // read content from the file
    var fileBase64String = await encodeFileAsBase64String(fileInput);
    var fileType = fileInput.type;
    var fileName = fileInput.name;
    // setting up s3 upload parameters
    try {
     var header = { headers: {
        "x-api-key": process.env.REACT_APP_AWS_TEMPLATE_API_KEY
     }};

    var body = {
        bucket: BUCKET_NAME,
        fileName: fileName,
        content: fileBase64String,
        contentType: fileType
    };

    //Create and send API request to /template endpoint
    const res = await axios.post(`https://q6z3mxhv9d.execute-api.us-east-1.amazonaws.com/v1/template`, 
                                    body, header);
    } catch (e) {
      console.error(e);
    }
    
};

const encodeFileAsBase64String = async (fileInput) => {
   return new Promise((resolve, reject) => {
        try {

            let reader = new FileReader();
            reader.onload = function() {
                if(reader.readyState === FileReader.DONE) {
                    resolve(reader.result);
                }
            };
            reader.readAsDataURL(fileInput);
        } catch(err) {
            reject(err);
        }
   });
};

export {uploadFile}