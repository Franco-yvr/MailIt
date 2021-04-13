import React, {useEffect, useState} from "react";
import TemplateLogTable from "./TemplateLogTable";
import HomePageRight from "./HomePageRight";
import "../../styles/HomePage.css"
import {Redirect} from "react-router";
import {Link} from "react-router-dom";


class HomePage extends React.Component {
	
	 
	constructor(props) {
		super(props);
		this.onUploadSuccess = this.onUploadSuccess.bind(this);
		this.id = 0;
		console.log(this.props.user)
		this.state = {
			authenticated: this.props.user,
		}
		console.log(this.state);
	}
    

	onUploadSuccess() {
		this.forceUpdate();
	}

	render() {
		if (this.state.authenticated !== true) {
			console.log("are we here?");
			return <Redirect to="/" />
		} else {
			console.log("please");
			this.id += 1;
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
				<div className="container-fluid" >
					<div className="row">
						<HomePageRight onUploadSuccess={this.onUploadSuccess}/>
						<TemplateLogTable id={this.id}/>
					</div>
				</div>
				</div>
			);
		}


	}
}

export default HomePage