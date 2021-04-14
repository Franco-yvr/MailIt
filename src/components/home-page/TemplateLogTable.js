import React from "react";
import axios from 'axios';

import Table from "../Table"

const MAX_FILENAME_STRING_CHARACTERS_SHOWN = 20;
const MAX_TEMPLATE_NAME_STRING_CHARACTERS_SHOWN = 20;
const MAX_DYNAMIC_VALUE_STRING_CHARACTER_SHOWN = 30;

class TemplateLogTable extends React.Component {
    constructor(props) {
        super(props);
        this.defaultColumns = ["File Name", "Template Name", "Upload Date", "Dynamic Values", "Create Email Campaign", "Campaign Logs"];
        this.sortableColumns = ["File Name",  "Template Name", "Upload Date"];
        this.state = {table: null, columns: []};
        this.getTableData = this.getTableData.bind(this);
    }

    componentDidMount() {
        this.getTableData()
    }

    componentDidUpdate(prevProps) {
        if (this.props.id !== prevProps.id) {
            this.getTableData()
        }
    }

    //Retrieve Tempalte logs from tTemplateLog DynamoDb to create a table
    getTableData() {
          
       var config = {
            method: 'get',
            url: 'https://cif088g5cd.execute-api.us-east-1.amazonaws.com/v1/logs',
            headers: { 
              'Content-Type': 'application/json',
              'x-api-key': process.env.REACT_APP_AWS_TEMPLATE_LOG_API_KEY
            }
          };
          
          axios(config)
          .then(response => {
            this.sortTemplateLogs(response.data);
            let table = this.dataToTable(response.data);
            this.setState({table: table, columns: table.columns.map(({title}) => {
                if(this.defaultColumns.includes(title)) {
                    return title;
                }
            })})
          })
          .catch(function (error) {
            console.log("Get Table Data Error",error);
        });   
    }

    render() {
        let table = this.state.table;
        let columnsProp = this.getColumnsPropToTable();
        return ( 
            <div className="col-lg-9">
                <h1 className="mt-2">Template logs</h1>
                {table? <Table data={table} 
                columns={columnsProp}
                className="ml-1"/> : 
                <Table loading={true}/>}
            </div>        
        );
    }

    //This is for providing specialized sorting in the Table based on the column name
    getColumnsPropToTable() {
        return this.state.columns.map((column) => {
            let columnProp = {title: column, sort: this.sortableColumns.includes(column)}
            if (column === "Upload Date") {
                columnProp["compare"] = function (dateA, dateB) {
                    let DMY_A = dateA.split("/");
                    let DMY_B = dateB.split("/");
                    let dateObjA = new Date(DMY_A[2], DMY_A[1], DMY_A[0]);
                    let dateObjB = new Date(DMY_B[2], DMY_B[1], DMY_B[0]); 
                    return dateObjA - dateObjB;                     
                }
            }
            return columnProp;
        })
    }

    //Convert response data from /template-logs api to a table
    dataToTable(data) {
        let columnTitles = [
            {displayName:"File Name", apiName: "S3Key"}, 
            {displayName:"Template Name", apiName: "TemplateName"}, 
            {displayName:"Upload Date", apiName: "DocUploadDateTime"},
            {displayName:"Dynamic Values", apiName: "DynamicValues"},
            {displayName:"Create Email Campaign", apiName: "UploadStatus"},
            {displayName:"Campaign Logs", apiName: ""}
        ];
        let table = {columns: []};
        if (data.statusCode === 200) {
            for (let i = 0; i < columnTitles.length; i++) {
                let columnTitle = columnTitles[i];
                table.columns.push({
                    title: columnTitle.displayName,
                    content: this.setCellContent(columnTitle, data)
                });
            }
        } else {
            console.log("Request failed with " + data.statusCode)
        }
        let templateKeyColumn = this.getColumnWithDisplayName("File Name", table);
        table.numRows = templateKeyColumn.content.length;
        this.addLinksToCampaignPage(table);
        this.addLinksToCampaignLogTable(table)
        //this.truncateDynamicValues(table)
        return table;
    }

    /**
 	* Set the content of a cell
 	* @param {columnTitle} - string
    * @param {data} - string
 	}}
 	*/
    setCellContent(columnTitle, data) {
        let content = [];
        for (let row of data.body) {
           let apiName = columnTitle.apiName;
            switch (columnTitle.displayName) {
                case "Campaign Logs": {
                    content.push({button: {displayName: "View", link: "", data: ""}});
                    break;
                }
                case "Dynamic Values": {
                    let value = row[columnTitle.apiName];

                    let commaList = this.arrayToCommaSeperatedString(value);
                    let maybeTruncatedContent = this.getTruncatedContentIfTooLong(commaList, MAX_DYNAMIC_VALUE_STRING_CHARACTER_SHOWN);
                    content.push(maybeTruncatedContent);
                    //Need to remove this once dynamic value parsing is complete
                    break;
                }
                case "Create Email Campaign": {
                    let value = row[columnTitle.apiName];
                    if (value === "Ready") {
                        content.push({button: {displayName:"Start", link:"", data: ""}});
                    } else {
                        content.push(value);
                    }
                    break;
                }
                case "Upload Date": {
                    let value = row[columnTitle.apiName];
                    if (value) {
                        let dateObj = new Date(value);
                        var date = dateObj.getDate();
                        var month = dateObj.getMonth() + 1; // Since getMonth() returns month from 0-11 not 1-12
                        var year = dateObj.getFullYear();
                            
                        var dateString = date + "/" + month + "/" + year;
                        content.push(dateString);
                    } else {
                        content.push(" ");
                    }
                    break;
                }
                case "File Name": {
                    let filename = row[columnTitle.apiName];
                    let maybeTruncatedContent = this.getTruncatedContentIfTooLong(filename, MAX_FILENAME_STRING_CHARACTERS_SHOWN);
                    content.push(maybeTruncatedContent);
                    break;
                } case "Template Name": {
                    let templateName = row[columnTitle.apiName];
                    let maybeTruncatedContent = this.getTruncatedContentIfTooLong(templateName, MAX_TEMPLATE_NAME_STRING_CHARACTERS_SHOWN);
                    content.push(maybeTruncatedContent);
                    break;
                }

                default:
                    if (apiName) {
                        content.push(row[columnTitle.apiName]);
                    }
                }
        }
        return content;
    }

    /**
 	* Retrieve truncated content object if content exceeds max_length
 	* @param {content} - string
    * @param {max_length} - string
 	}}
 	*/
    getTruncatedContentIfTooLong(content, max_length) {
        if (content && (content.length > max_length)) {
            let truncatedFilename = this.truncateString(content, max_length);
            return {truncatedContent: {truncatedVersion: truncatedFilename,
            fullVersion: content}};
        } else {
            return content;
        }
    }

    /**
 	* Method to  truncate a string given the number of characters to show
 	* @param {str} - string
    * @param {numCharactersToChow} - number
 	}}
 	*/
    truncateString(str, numCharactersToShow) {
        return str.slice(0, numCharactersToShow) + "...";
    }

    /**
 	* Populate content objects for column that will be linked to Campaign page 
    * which will be used to create a button associated with a Link object
 	* @param {table} - Array[Object]
 	}}
 	*/
    addLinksToCampaignPage(table) {
        let fileNameColumn = this.getColumnWithDisplayName("File Name", table);
        
        let templateNameColumn = this.getColumnWithDisplayName("Template Name", table);
        
        let dynamicValuesColumn = this.getColumnWithDisplayName("Dynamic Values", table);
        let statusColumn = this.getColumnWithDisplayName("Create Email Campaign", table);
        let content = statusColumn.content;
        for(let i = 0; i < content.length; i++) {
            let current = content[i];
            

            if (typeof current === "object") {
                let fileNameContent = "";
                if(typeof fileNameColumn.content[i] === "object") {
                    fileNameContent = fileNameColumn.content[i].truncatedContent.fullVersion;
                } else {
                    fileNameContent = fileNameColumn.content[i]
                }

                let templateNameContent = "";
                if(typeof templateNameColumn.content[i] === "object") {
                    templateNameContent = templateNameColumn.content[i].truncatedContent.fullVersion;
                } else {
                    templateNameContent = templateNameColumn.content[i]
                }

                let dynamicValuesContent = "";
                if(typeof dynamicValuesColumn.content[i] === "object") {
                    dynamicValuesContent = dynamicValuesColumn.content[i].truncatedContent.fullVersion;

                } else {
                    dynamicValuesContent = dynamicValuesColumn.content[i]
                }
                current.button.link = `campaignPage/${templateNameContent}`;
                console.log(current.button.link);
                current.button.data = {dynamicValues: JSON.parse(this.commaSeperatedStringToArray(dynamicValuesContent)), 
                                       templateKey: fileNameContent};
                console.log(current.button.data);
            }
        }
    }

    /**
 	* Populate content objects for column that will be linked to Campaign Log Table page 
    * which will be used to create a button associated with a Link object
 	* @param {table} - Array[Object]
 	}}
 	*/
    addLinksToCampaignLogTable(table) {
        let templateNameColumn = this.getColumnWithDisplayName("Template Name", table);
        let CampaignLogsColumn = this.getColumnWithDisplayName("Campaign Logs", table);
        let content = CampaignLogsColumn.content;
        for(let i = 0; i < content.length; i++) {
            let current = content[i];
            if (typeof current === "object") {
                let templateNameContent = "";
                if(typeof templateNameColumn.content[i] === "object") {
                    templateNameContent = templateNameColumn.content[i].truncatedContent.fullVersion;
                } else {
                    templateNameContent = templateNameColumn.content[i]
                }
                current.button.link = `CampaignLogTable`;
                current.button.data = {
                    templateName: templateNameContent};
            }
        }
    }

    /**
 	* Get the column data using the display name of the table
 	* @param {displayName} - string
    * @param {table} - Array[Object]
 	}}
 	*/
    getColumnWithDisplayName(displayName, table) {
        for (let column of table.columns) {
            if (column.title === displayName) {
                return column;
            }
        }
    }

    /**
 	* Sort the template log data by data
 	* @param {campaignLogs} - Array[Object]
 	}}
 	*/
    sortTemplateLogs(templateLogs) {
        templateLogs.body.sort((a, b) => {
            let dateA = new Date(a.DocUploadDateTime);
            let dateB = new Date(b.DocUploadDateTime)
            return dateB - dateA;
        });
    }

    /**
 	* Convert an array of dynamic values to a comma seperated string in the UI
 	* @param {dynamicValueString} - Array[Object]
 	}}
 	*/
    arrayToCommaSeperatedString(dynamicValueString) {
        let newString = dynamicValueString
                            .replace("]", "");
        newString = newString.replace("[", "");
        return newString;
    }

    /**
 	* Convert an comma seperated string in the UI to a dynamic value array
 	* @param {dynamicValueString} - Array[Object]
 	}}
 	*/
    commaSeperatedStringToArray(dynamicValueString) {
        return "[" + dynamicValueString + "]";
    }

}

export default TemplateLogTable;
