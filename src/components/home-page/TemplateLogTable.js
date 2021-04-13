import React from "react";
import axios from 'axios';

import Table from "../Table"

const MAX_DYNAMIC_VALUES_SHOWN = 3; //maximum number of dynamic values shown before truncation
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
        this.onSelectedColumnsChange = this.onSelectedColumnsChange.bind(this);
    }

    componentDidMount() {
        this.getTableData()
    }

    componentDidUpdate(prevProps) {
        if (this.props.id != prevProps.id) {
            this.getTableData()
        }
    }

    getTableData() {
        // var data = JSON.stringify({
        //     "min": 0,
        //     "max": 5
        // });
          
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
            console.log(error);
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

    onSelectedColumnsChange(checkedStates) {
        let additionalColumns = [];
        for (let {value, checked} of checkedStates) {
            if (checked) {
                additionalColumns.push(value);
            }
        }
        this.setState({columns: this.defaultColumns.concat(additionalColumns)})
    }

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
                    content: this.getContent(columnTitle, data)
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

    // truncateDynamicValues(table) {
    //     let dynamicValuesColumn = this.getColumnWithDisplayName("Dynamic Values", table);
    //     let content = dynamicValuesColumn.content;
    //     for (let i = 0; i < content.length; i++) {
    //         let row = content[i];
    //         let dynamicValues = row.split(",");
    //         if (dynamicValues.length > MAX_DYNAMIC_VALUES_SHOWN) {
    //             content[i] = {truncatedContent: {truncatedVersion: this.truncateDynamicValuesRow(row), 
    //                 fullVersion: row}}
    //         }
    //     }
    //     dynamicValuesColumn = this.getColumnWithDisplayName("Dynamic Values", table); 
    // }

    // truncateDynamicValuesRow(row) {
    //     let dynamicValues = row.split(",");
    //     let dynamicValuesShown = dynamicValues.slice(0, MAX_DYNAMIC_VALUES_SHOWN);
    //     let stringVersion = dynamicValuesShown.join(",");
    //     return stringVersion + "...";
    // }

    getContent(columnTitle, data) {
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
                    if (value == "Ready") {
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
                } case "Team": {
                    
                }

                default:
                    if (apiName) {
                        content.push(row[columnTitle.apiName]);
                    }
                }
        }
        return content;
    }

    getTruncatedContentIfTooLong(content, max_length) {
        if (content && (content.length > max_length)) {
            let truncatedFilename = this.truncateString(content, max_length);
            return {truncatedContent: {truncatedVersion: truncatedFilename,
            fullVersion: content}};
        } else {
            return content;
        }
    }

    truncateString(str, numCharactersToShow) {
        return str.slice(0, numCharactersToShow) + "...";
    }

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

    getColumnWithDisplayName(displayName, table) {
        for (let column of table.columns) {
            if (column.title === displayName) {
                return column;
            }
        }
    }

    sortTemplateLogs(templateLogs) {
        templateLogs.body.sort((a, b) => {
            let dateA = new Date(a.DocUploadDateTime);
            let dateB = new Date(b.DocUploadDateTime)
            return dateB - dateA;
        });
    }

    arrayToCommaSeperatedString(dynamicValueString) {
        let newString = dynamicValueString
                            .replace("]", "");
        newString = newString.replace("[", "");
        return newString;
    }

    commaSeperatedStringToArray(dynamicValueString) {
        return "[" + dynamicValueString + "]";
    }

}

export default TemplateLogTable;