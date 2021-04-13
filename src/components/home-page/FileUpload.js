import React from "react";
import { convertToTemplate, uploadFile, removeFile } from "../../aws_util"



class FileUpload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedFile: '', templateName: '', templateNameR: '', message: null, removal_message: null, uploading: false,
            checking: false, setVisible: true
        }
        this.messages = Object.freeze({
            WRONG_FILE_TYPE: "Wrong template file type. Please upload a .docx file.",
            UPLOAD_FAIL: "Upload Failure",
            EMPTY_FIELD: "At least one field is empty. Please fill in both fields to continue.",
            TEMPLATE_NAME_INCORRECT_FORMAT: "The template name can only contain alpha numeric characters, underscores and/or hyphens",
            EMPTY_TEMPLATE_NAME: "The template name is empty. Please provide a template name to continue.",
            SUCCESS: "Sucessfully uploaded file"
        });
        this.removal_message = Object.freeze({
            REMOVE_FAILED: "Template Removal failed. Please verify Template Name corresponds to an Active Template.",
            EMPTY_FIELD: "The text field is empty. Please enter a Template Name to continue.",
            TEMPLATE_NAME_INCORRECT_FORMAT: "The template name can only contain alpha numeric characters, underscores and/or hyphens. This does not appear to be a valid Template Name. ",
            SUCCESSFUL_REMOVAL: "Sucessfully removed a template"
        });
        this.onFileChange = this.onFileChange.bind(this);
        this.onTemplateNameChange = this.onTemplateNameChange.bind(this);
        this.onTemplateNameChangeR = this.onTemplateNameChangeR.bind(this);
        this.onFileUpload = this.onFileUpload.bind(this);
        this.onFileRemove = this.onFileRemove.bind(this);
    }
    SubmitTemplate = () => (
        <div className="text-center">
            <p className="mt-5 text-center">Upload Template</p>
            {this.state.message != null ?
                <div
                    className={
                        this.state.message === this.messages.SUCCESS ? "alert alert-success" : "alert alert-danger"}
                    role="alert">
                    {`${this.state.message}`}
                </div>
                :
                <div></div>
            }
            {this.state.uploading ?
                <div className="horizontal-center">
                    <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }}
                        role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div> :
                <div></div>
            }

            <form>
                <div className="form-group pb-5">
                    <input type="file" className="form-control-file my-row2" id="fileUploadButton" onChange={this.onFileChange} />
                </div>
                <div className="row justify-content-space-evenly my-row2">
                    <div className="input-group mb-2">
                        <div className="input-group-prepend">
                            <span className="input-group-text">Template Name</span>
                        </div>
                        <input
                            type="text"
                            id="template-name"
                            className="form-control"
                            aria-label="TemplateName"
                            onChange={this.onTemplateNameChange}
                            required>
                        </input>
                    </div>
                </div>

            </form>

            <button className="btn btn-primary btn-block mt-5" id='SubmitTemplate' onClick={this.onFileUpload}> Submit Template</button>
        </div>
    )


    RemoveTemplate = () => (
        <div>
            <p className="mt-5 text-center">Remove a Template</p>
            {this.state.removal_message != null ?
                <div
                    className={
                        this.state.removal_message === this.removal_message.SUCCESSFUL_REMOVAL ? "alert alert-success" : "alert alert-danger"}
                    role="alert">
                    {`${this.state.removal_message}`}
                </div>
                :
                <div></div>
            }
            {this.state.checking ?
                <div className="horizontal-center">
                    <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }}
                        role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div> :
                <div></div>
            }


            <div className="row justify-content-space-evenly my-row2">
                <div className="input-group mb-2">
                    <div className="input-group-prepend">
                        <span className="input-group-text">Template Name</span>
                    </div>
                    <input
                        type="text"
                        id="template-nameR"
                        className="form-control"
                        aria-label="TemplateNameR"
                        onChange={this.onTemplateNameChangeR}
                        required>
                    </input>
                </div>
            </div>

            <button className="btn btn-primary btn-block mt-5" id='RemoveTemplate' onClick={this.onFileRemove}> Remove Template </button>
        </div>
    )


    render() {
        return (
            <div>
                <div class="dropdown text-center">
                    <button class="btn btn-primary dropdown-toggle mt-2" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Submit/Remove Template
                    </button>
                    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        <a class="dropdown-item" onClick={() => this.setState({ setVisible: true })}>Submit Template</a>
                        <a class="dropdown-item" id="RemoveTemplateDropDown" onClick={() => this.setState({ setVisible: false })}>Remove Template</a>
                    </div>
                </div>
                {this.state.setVisible ? this.SubmitTemplate() : this.RemoveTemplate()}
            </div>
        )
    }

    onFileChange(event) {
        this.setState({ selectedFile: event.target.files[0], message: null });
    }

    onTemplateNameChange(event) {
        this.setState({ templateName: event.target.value });
    }

    onTemplateNameChangeR(event) {
        this.setState({ templateNameR: event.target.value });
    }



    onFileUpload() {
        //Validate template name
        let templateNameInput = document.getElementById('template-name');
        let isEmptyField = false;
        let isTemplateNameCorrectFormat = true;
        let templateName = this.state['templateName'];

        this.setState({ message: null });
        if (this.isEmptyStringOrNull(templateName.trim())) {
            isEmptyField = true;
            templateNameInput.classList.add("inputError");
        } else {
            templateNameInput.classList.remove("inputError");
        }

        if (!this.isTemplateNameFormattedCorrectly(templateName)) {
            isTemplateNameCorrectFormat = false;
            templateNameInput.classList.add("inputError");
        } else {
            templateNameInput.classList.remove("inputError");
        }

        var allowedExtensions = /(\.docx)$/i;
        var fileInput = this.state.selectedFile;
        var filePath;

        if (fileInput) {
            filePath = fileInput.name;
        }

        if (!fileInput || isEmptyField) {
            this.setState({ message: this.messages.EMPTY_FIELD });
        } else if (!isTemplateNameCorrectFormat) {
            this.setState({ message: this.messages.TEMPLATE_NAME_INCORRECT_FORMAT });
        } else if (!allowedExtensions.exec(filePath)) {
            this.setState({ message: this.messages.WRONG_FILE_TYPE });
        } else {
            this.setState({ uploading: true });
            uploadFile(fileInput, 'docxtemplates', templateName).then(() => {
                this.setState({ message: this.messages.SUCCESS, processing: false, uploading: false });
                this.props.onUploadSuccess();
            }).catch(error => {
                console.log(error);
                this.setState({ message: this.messages.UPLOAD_FAIL + ": " + error.message, uploading: false });
            });
        }
    }

    onFileRemove() {
        //Validate template name
        let templateNameInputR = document.getElementById('template-nameR');
        let isEmptyFieldR = false;
        let isTemplateNameCorrectFormatR = true;
        let templateNameR = this.state['templateNameR'];

        this.setState({ removal_message: null });
        if (this.isEmptyStringOrNull(templateNameR.trim())) {
            isEmptyFieldR = true;
            templateNameInputR.classList.add("inputError");
        } else {
            templateNameInputR.classList.remove("inputError");
        }

        if (!this.isTemplateNameFormattedCorrectly(templateNameR)) {
            isTemplateNameCorrectFormatR = false;
            templateNameInputR.classList.add("inputError");
        } else {
            templateNameInputR.classList.remove("inputError");
        }

        if (isEmptyFieldR) {
            this.setState({ removal_message: this.removal_message.EMPTY_FIELD });
        } else if (!isTemplateNameCorrectFormatR) {
            this.setState({ removal_message: this.removal_message.TEMPLATE_NAME_INCORRECT_FORMAT });
        } else {
            this.setState({ checking: true });
            removeFile(templateNameR).then(() => {
                this.setState({ removal_message: this.removal_message.SUCCESSFUL_REMOVAL, checking: false });
                this.props.onUploadSuccess();
            }).catch(error => {
                console.log(error);
                this.setState({ removal_message: this.removal_message.REMOVE_FAILED, checking: false });
            });
        }




    }

    isEmptyStringOrNull(string) {
        return string == null || string === "";
    }

    isTemplateNameFormattedCorrectly(string) {
        let templateNameRegex = /^[\-\w]*$/;
        return templateNameRegex.test(string);
    }
}

export default FileUpload;