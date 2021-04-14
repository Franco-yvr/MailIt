import React from "react";
import axios from 'axios';
import Table from "../components/Table";
import CampaignLogTable from "../components/CampaignLogTable";
import { Link } from "react-router-dom";
import {Redirect} from "react-router";

// const DATA_LINK = "https://cif088g5cd.execute-api.us-east-1.amazonaws.com/v1/email-logs"

class EmailLogTable extends React.Component {
    constructor(props) {
        super(props);
        this.defaultColumns = ["Message Id", 
                               "Sent Date", 
                               "Email Address", 
                               "Delivery Status", 
                               "Open Status",
                               "Clicked Link Status"];
        this.sortableColumns = ["Message Id", 
                               "Sent Date", 
                               "Email Address", 
                               "Delivery Status", 
                               "Open Status",
                               "Clicked Link Status"];
        this.state = {
            templateName: this.props.location.state.templateName,
            campaignId: this.props.location.state.campaignId,
            columns: [],
            authenticated: this.props.user
        }
        console.log(this.state);
    }

    getEmailTableData() {
        var apiString = `https://cif088g5cd.execute-api.us-east-1.amazonaws.com/v1/email-logs?templateId=${this.state.templateName}&campaignId=${this.state.campaignId}`
        console.log(apiString);
        var config = {
            method: 'get',
            url: apiString,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': "TKrgRRW19c5YY4DREgvfd3nqD0lZh4RP12KvwQBC"
            }
        };

        axios(config)
            .then(response => {
                console.log(response);
                let table = this.dataToTable(response.data);
                this.setState({table: table})
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    componentDidMount() {
        this.getEmailTableData()
    }


    render() {
        let table = this.state.table;
        if (table) {
            this.state.columns = table.columns.map(({title}) => title);
        }
        if (this.state.authenticated !== true) {
            return <Redirect to="/"/>
        } else {
            return (
                <div>
                <div className="d-flex justify-content-end">
                        <Link
                            role="button"
                            id="logOutButton"
                            to={"/"}
                            className="btn btn-primary mr-1 mt-1"
                            >
                            Log out
                        </Link>
				</div>
                <div className="scroll container-fluid" style={{"max-width": "100%"}}>
                    <div className="float-left col-lg-3 ">
                        <Link 
                            className="btn btn-primary d-block mt-5 ml-5 mr-5 mb-5"
                            role="button"
                            to={{pathname: "/CampaignLogTable/", state: {templateName: this.state.templateName}}}>
                            {"Return to Campaign Page"}
                        </Link>
                        <Link 
                            className="btn btn-primary d-block mt-5 ml-5 mr-5 mb-5"
                            role="button"
                            id="homepagebutton"
                            to={"/HomePage"}>
                            {"Return to Home Page"}
                        </Link>
                    </div> 
                    <div className="float-right col-lg-9 pl-0 pr-1">
                        <h1 className="mt-2">{`Email logs`}</h1>
                        {table? <Table data={table} 
                        columns={this.state.columns.map((column) => {
                            return {title: column, sort: this.sortableColumns.includes(column)}
                        })}/> : 
                        <Table loading={true}/>}
                    </div>
                </div>  
                </div>   
            );
        }
    }

    dataToTable(data) {
        let columnTitles = [
            {displayName:"Message Id", apiName: "MessageId"},
            {displayName:"Sent Date", apiName: "SentDateTime"}, 
            {displayName:"Email Address", apiName: "EmailAddress"}, 
            {displayName:"Delivery Status", apiName: "DeliveryStatus"}, 
            {displayName:"Open Status", apiName: "OpenedStatus"}, 
            //{displayName:"Has A Link Been Clicked?", apiName: "ClickedLinkStatus"},
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
        let messageIdColumn = this.getColumnWithDisplayName("Message Id", table);
        console.log(messageIdColumn);
        table.numRows = messageIdColumn.content.length;
        return table;
    }

    getContent(columnTitle, data) {
        let content = [];
        for (let row of data.body.Items) {
           let apiName = columnTitle.apiName;
            switch (columnTitle.displayName) {
                case "Message Id": {
                    content.push(row['MessageId']);
                    break;
                }
                case "Sent Date": {
                    let value = row['SentDateTime'];
                    content.push(value);
                    break;
                }
                case "Email Address": {
                    let value = row['EmailAddress'];
                    content.push(value);
                    break;
                }
                case "Delivery Status": {
                    let value = row['DeliveryStatus'].toString();
                    content.push(value);
                    break;
                }
                case "Open Status": {
                    let value = row['OpenedStatus'].toString();
                    content.push(value);
                    break;
                }
                case "Has A Link Been Clicked?": {
                    let value = row['ClickedLinkStatus'].toString();
                    content.push(value);
                    break;
                }
                // default:
                //     if (apiName) {
                //         content.push(row[columnTitle.apiName]);
                //     }
                }
        }
        return content;
    }


    getColumnWithDisplayName(displayName, table) {
        for (let column of table.columns) {
            if (column.title === displayName) {
                return column;
            }
        }
    }


}

export default EmailLogTable;
