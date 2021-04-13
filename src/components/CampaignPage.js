import React from "react";
import "../App.css";
import userLogo from '../assets/userLogo.png';
import sendSingleEmail from '../api-service.js'
import BatchEmailCampaignCreation from "./BatchEmailCampaignCreation";
import { Link } from "react-router-dom";
import {Redirect} from "react-router";
var AWS = require('aws-sdk');
var mammoth = require("mammoth");

const BUCKET_NAME = "docxtemplates"

const EMAIL_FORMAT_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

AWS.config.update(
    {
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    }
);

class CampaignPage extends React.Component {
    constructor(props) {
        super(props);
        this.messages = Object.freeze({
            INCORRECT_EMAIL_FORMAT:   "Email Address is incorrectly formatted. Please provide a correctly formatted email and try again.",
            EMAIL_CONTAINS_WHITESPACE: "Email Addresss contains whitespace. Please remove the whitespace and try again.",
            EMPTY_FIELD:  "At least one field is empty. Please fill all inputs above and try again.",
            SUCCESS: "Sucessfully sent email file",
            SINGLE_EMAIL_GENERAL_ERROR: "An error occured when trying to send your email, please check the console for more details.",
            EMAIL_NOT_SES_VERIFIED: "This Email Address is not registered with this service. Please ask the team to register your email before continuing."
        });
        this.state = { 
            templateKey: this.props.location.state.templateKey,
            docHtml: '', 
            dynamicValues: this.props.location.state.dynamicValues,
            templateName: this.props.match.params.templateName,
            emailAddress: '' ,
            message: null,
            loading: false,
            subjectLine: "",
            authenticated: this.props.user
        }
        console.log(this.state);
        
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubjectLineChange = this.handleSubjectLineChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    render() {
        if (this.state.authenticated !== true) {
            return <Redirect to="/" />
        } else {
            return (
                <div className="container-fluid my-container">
                    <div className="row my-rows" style={{ textAlign: 'center' }}>
                        <div className="col-6 my-col">{`Preview Template: ${this.state.templateName}`}</div>
                        <div className="col-6 my-col">Create Email Campaign</div>
                    </div>
                    <div className="row my-rows">
                        {this.state.docHtml?
                            <div className="col-6 my-col img-responsive overflow-auto" style={{wordWrap: 'break-word'}}  dangerouslySetInnerHTML={{ __html: this.state.docHtml }} /> :
                            <div className="col-6 my-col">
                                <div className="vertical-horizontal-center">
                                    <div className="spinner-border text-primary" style={{width: "6rem", height: "6rem"}} role="status"></div>
                                </div>
                            </div>}

                        <div className="col-6 my-col">
                            <Link
                                className="btn btn-primary float-right mt-2"
                                role="button"
                                id="homepagebutton"
                                to={"/HomePage"}>
                                {"Return to Home Page"}
                            </Link>
                            <div className="row my-row1"></div>
                            <div className="row justify-content-space-evenly my-row mt-5 mb-2">
                                <img src={userLogo} className="img-rounded" width="30" height="30" />

                            </div>
                            <div className="form-group">
                                <div className="row justify-content-space-evenly my-row2">
                                    <div className="input-group mb-1">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text">Single Email Address</span>
                                        </div>
                                        <input
                                            type="text"
                                            id="email-address"
                                            className="form-control"
                                            aria-label="EmailAddress"
                                            onChange={this.handleEmailChange}
                                            required>
                                        </input>
                                    </div>
                                </div>
                                <div className="row justify-content-space-evenly my-row2">
                                    <div className="input-group mb-1">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text">Subject Line</span>
                                        </div>
                                        <input
                                            type="text"
                                            id="subject-line"
                                            className="form-control"
                                            aria-label="subjectLine"
                                            onChange={this.handleSubjectLineChange}
                                            required>
                                        </input>
                                    </div>
                                </div>
                                {this.state.dynamicValues.length > 0 ?
                                    <div className="row justify-content-space-evenly my-row2">
                                        Dynamic Values
                                        <div className="input-group mb-1">
                                            {this.createDynamicValueTextFields()}
                                        </div>
                                    </div> : null }
                            </div>
                            <div className="row justify-content-right my-row1 mb-1 button-spacing">
                                <button type="button" className="btn btn-success" id='button1' onClick={this.handleSubmit}>Submit</button>
                            </div>
                            {this.state.loading ?
                                <div className="horizontal-center">
                                    <div className="spinner-border text-primary" style={{width: "2rem", height: "2rem"}}
                                         role="status">
                                    </div>
                                </div>: null
                            }
                            {this.state.message != null ?
                                <div id={
                                    this.state.message === this.messages.SUCCESS ? "emailSentAlert" : "emailSentFailed" }
                                     className={
                                         this.state.message === this.messages.SUCCESS ? "alert alert-success" : "alert alert-danger" }
                                     role="alert">
                                    {`${this.state.message}`}
                                </div>
                                :
                                <div></div>
                            }
                            <BatchEmailCampaignCreation dynamicValues={this.state.dynamicValues} templateName={this.state.templateName} />
                        </div>
                    </div>
                </div>
            );
        }
    }

    async componentDidMount() {
        var s3 = new AWS.S3();
        console.log(this.state.templateKey);
        s3.getObject({ Bucket: BUCKET_NAME, Key: this.state.templateKey }, (err, data) => {
            if (err) {
                console.log(err);
                throw err
            }
            mammoth.convertToHtml({ arrayBuffer: data.Body }).then((v, m) => {
                this.setState({ docHtml: v.value });
            });
        });
    }

    createDynamicValueTextFields() {
        let dynamicValueTextInputs = []
        for (var dynamicValue of this.state.dynamicValues ) {
            let textInput = 
                <div key={dynamicValue} className="input-group mb-1">
                    <div className="input-group-prepend">
                        <span className="input-group-text" id={dynamicValue}>{dynamicValue}</span>
                    </div>
                    <input 
                        type="text" 
                        className="single-email form-control" 
                        aria-label={dynamicValue} 
                        onChange={this.handleInputChange} 
                        required></input>
                </div>
            dynamicValueTextInputs.push(textInput);
        }
        return dynamicValueTextInputs;
    }

    handleEmailChange(event) {
        this.setState({emailAddress: event.target.value});
    }

    handleSubjectLineChange(event) {
        this.setState({subjectLine: event.target.value});
    }

    handleInputChange(event) {
        var dynamicValueName = event.target.getAttribute('aria-label');
        let dynamicValueObject = {};
        dynamicValueObject[dynamicValueName] = event.target.value;
        this.setState(dynamicValueObject);
    }

    handleSubmit(event) {
        let dynamicValueInputs = document.getElementsByClassName('single-email');
        let emailAddressInput = document.getElementById('email-address');
        let subjectLineInput = document.getElementById('subject-line');
        let dynamicValueObject = {};
        let emptyField = false;
        let incorrectlyFomattedEmail = false;
        let emailContainsWhitespace = false;
        let emailAddress = this.state['emailAddress'];
        let subjectLine = this.state['subjectLine'].trimEnd();

        //Validate Email is of the correct format
        if(this.isEmptyStringOrNull(emailAddress)) {
            emailAddressInput.classList.add("inputError");
            emptyField = true;
        }
        emailAddress = emailAddress.trimEnd();
        if (this.doesEmailContainWhitespace(emailAddress)) {
            emailAddressInput.classList.add("inputError");
            emailContainsWhitespace = true;
        } else if(!this.isEmailCorrectlyFormatted(emailAddress)) {
            emailAddressInput.classList.add("inputError");
            incorrectlyFomattedEmail = true;
        } else {
            emailAddressInput.classList.remove("inputError");
        }

        //Validate Subject Line
        if(this.isEmptyStringOrNull(subjectLine)) {
            subjectLineInput.classList.add("inputError");
            emptyField = true;
        } else {
            subjectLineInput.classList.remove("inputError");
            dynamicValueObject['SUBJECT_LINE'] = this.state.subjectLine;
        }
        
        //Validate Dynamic Value Inputs are correctly formatted
        for(var input of dynamicValueInputs) {
            var dynamicValue = input.getAttribute("aria-label");
            if(this.state[dynamicValue] == undefined || this.isEmptyStringOrNull(this.state[dynamicValue].trimEnd())) {
                input.classList.add("inputError");
                emptyField = true;
            } else {
                input.classList.remove("inputError");
                dynamicValueObject[dynamicValue] = input.value;
            }
        }    
        

        if(!incorrectlyFomattedEmail && !emptyField && !emailContainsWhitespace) {
                this.setState({message: null});
                var header = { headers: {
                    "x-api-key": "6oyO3enoUI9Uu26ZPtdXNA2YPPCbSWn2cFRrxwRh"
                }};

                var body = {
                    emailAddress: emailAddress,
                    dynamicValueStrings: JSON.stringify(dynamicValueObject),
                    templateId: this.state.templateName
                };
                this.setState({loading: true});
                sendSingleEmail(header, body).then(response => {
                    this.setState({loading: false});
                    if(response.status === 200) {
                        this.setState({ message: this.messages.SUCCESS })
                    } else {
                        this.setState({ message: this.messages.SINGLE_EMAIL_ERROR + response.data})
                    }
                }).catch(error => {
                    this.setState({loading: false});
                    if(error.response.data.includes("Email address is not verified")) {
                        this.setState({ message: this.messages.EMAIL_NOT_SES_VERIFIED})
                    } else {
                        console.log("Single Email Campaign Error: " + error.response);
                        this.setState({ message: this.messages.SINGLE_EMAIL_ERROR})
                    }
                    
                })

        } else if(emptyField){
            this.setState({ message: this.messages.EMPTY_FIELD });
        } else if(incorrectlyFomattedEmail) {
            this.setState({ message: this.messages.INCORRECT_EMAIL_FORMAT });
        } else if(emailContainsWhitespace) {
            this.setState({ message: this.messages.EMAIL_CONTAINS_WHITESPACE});
        }

    }

    isEmailCorrectlyFormatted(email) {
        return email.match(EMAIL_FORMAT_REGEX);
    }

    doesEmailContainWhitespace(email) {
        return email.includes(" ");
    }

    isEmptyStringOrNull(string) {
        return string == null || string === "";
    }

}
export default CampaignPage;
