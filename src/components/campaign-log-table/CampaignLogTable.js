import React from "react";
import axios from 'axios';
import Table from "../Table";
import { Link } from "react-router-dom";
import {Redirect} from "react-router";
import {Auth} from 'aws-amplify';
import {compareTableFormattedDate} from "../util.js";

class CampaignLogTable extends React.Component {
    constructor(props) {
        super(props);
        this.defaultColumns = ["CampaignId", 
                               "Date of Campaign Launch", 
                               "No. of People Emailed", 
                               "No. of Emails Successfully Delivered", 
                               "No. of Opened Emails",
                               "Email Log"];
        this.sortableColumns = ["CampaignId",  "Date of Campaign Launch", "No. of People Emailed",
        "No. of Emails Successfully Delivered", "No. of Opened Emails"];
        this.state = {
            templateName: this.props.location.state.templateName,
            table: null,
            columns: [],
            authenticated: false
        }
    }

    //Retrieve Campaign logs from AWS to create a table
    getLogTableData() {
        var apiString = "https://cif088g5cd.execute-api.us-east-1.amazonaws.com/v1/campaign-logs?templateId="
        var templateId = this.state.templateName;
        var queryString =  apiString.concat(templateId);
        var config = {
            method: 'get',
            url: queryString,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': "8nobK0hMri7W16vHzMj0S1SfOC5m7sPU4zxNBFX8"
            }
        };

        axios(config)
            .then(response => {
                this.sortCampaignLogs(response.data)
                let table = this.dataToTable(response.data.body);
                console.log(table);
                this.setState({table: table})
            })
            .catch(function (error) {
                console.log("Error getting Log Table Data:",error);
            });
    }

    async componentDidMount() {
        await Auth.currentAuthenticatedUser().then(() => {
			this.setState({authenticated: true});
            this.getLogTableData();
		}).catch(() => {
			this.setState({authenticated: false});
		});
    }

    onLogOut = async() => {
		await Auth.signOut();
	}

    //Render the campaign log grid page 
    render() {
        let table = this.state.table;
        if (table) {
            this.state.columns = table.columns.map(({title}) => title);
        }
        return (this.state.authenticated !== true? 
				<div>Access Denied</div>
				:
                <div>
                <div className="d-flex justify-content-end">
                    <Link
						to={"/"}
						>
						<button className="btn btn-primary mr-1 mt-1" 
							id='logOutButton' 
							onClick={this.onLogOut}> 
							Log Out 
						</button>
					</Link>
				</div>
                <div className="scroll container-fluid" style={{"max-width": "100%"}}>
                    <div className="float-left col-lg-3 ">
                        <Link 
                            className="btn btn-primary d-block mt-5 ml-5 mr-5 mb-5"
                            role="button"
                            id="homepagebutton"
                            to={"/HomePage"}>
                            {"Return to Home Page"}
                        </Link>
                    </div> 
                    <div className="float-right col-lg-9 pl-0 pr-1">
                        {table && table.numRows > 0 ? <h1 className="mt-2">{`Campaign logs: ${this.state.templateName}`}</h1> :
                        <div></div>}
                        {table? (table.numRows > 0 ? <Table data={table} columnsToSort={this.getColumnsToSort()}/> :
                        <h1 className="vertical-horizontal-center"> No campaigns for this template yet</h1> )
                        : 
                        <Table loading={true}/>}
                    </div>
                </div> 
                </div>       
            );    
        
            
    }

    //This generates the prop for telling the table which columns should be sortable
    getColumnsToSort() {
        return this.sortableColumns.map((column) => {
            let columnsToSort = {title: column, sort: this.sortableColumns.includes(column)}
            if (column === "Date of Campaign Launch") {
                columnsToSort["compare"] = compareTableFormattedDate;
            } else if (column === "No. of People Emailed" || 
                       column === "No. of Emails Successfully Delivered" || 
                       column === "No. of Opened Emails") {
                       columnsToSort["compare"] = function (strA, strB) {
                            return parseInt(strA) - parseInt(strB);
                       }
            }
            return columnsToSort;
        })
    }



    //Convert response data from /campaign-logs api to a table
    dataToTable(data) {
        let columnTitles = [
            {displayName:"CampaignId", apiName: "CampaignId"},
            {displayName:"Date of Campaign Launch", apiName: "SentDateTime"}, 
            {displayName:"No. of People Emailed", apiName: "NumEmailed"}, 
            {displayName:"No. of Emails Successfully Delivered", apiName: "NumSuccessfullyDelivered"},
            {displayName:"No. of Opened Emails", apiName: "NumOpened"},
            {displayName:"Email Log", apiName: ""}
        ];

        let table = {columns: []};
        for (let i = 0; i < columnTitles.length; i++) {
            let columnTitle = columnTitles[i];
            table.columns.push({
                title: columnTitle.displayName,
                content: this.setCellContent(columnTitle, data)
            });
        }
        let templateKeyColumn = this.getColumnWithDisplayName("CampaignId", table);
        table.numRows = templateKeyColumn.content.length;
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
        for (let row of data) {
           let apiName = columnTitle.apiName;
            switch (columnTitle.displayName) {
                case "Date of Campaign Launch": {
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
                case "No. of People Emailed": {
                    content.push(row[columnTitle.apiName].toString());
                    break;
                }
                case "No. of Emails Successfully Delivered": {
                    content.push(row[columnTitle.apiName].toString());
                    break;
                }
                case "No. of Opened Emails": {
                    content.push(row[columnTitle.apiName].toString());
                    break;
                }
                case "Email Log": {
                    content.push({
                        button: {
                            displayName: "View",
                            link: `/EmailLogTable/`,
                            data: {templateName: this.state.templateName, campaignId: row['CampaignId']},
                            }});
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
 	* Sort the campaign log data by data
 	* @param {campaignLogs} - Array[Object]
 	}}
 	*/
    sortCampaignLogs(campaignLogs) {
        campaignLogs.body.sort((a, b) => {
            let dateA = new Date(a.SentDateTime);
            let dateB = new Date(b.SentDateTime)
            return dateB - dateA;
        });
    }
}

export default CampaignLogTable;
