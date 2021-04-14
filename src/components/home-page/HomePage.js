import React from "react";
import TemplateLogTable from "./TemplateLogTable";
import "../../App.css";
import {Redirect} from "react-router";
import {Link} from "react-router-dom";
import FileUpload from "./file-upload/FileUpload";



class HomePage extends React.Component {
	
	 
	constructor(props) {
		super(props);
		this.onUploadSuccess = this.onUploadSuccess.bind(this);
		this.id = 0;
		this.state = {
			authenticated: this.props.user,
		}

		this.onUploadSuccess = this.onUploadSuccess.bind(this);
	}
    
	//If update is successfull update the template log grid
	onUploadSuccess() {
		this.forceUpdate();
	}

	render() {
		if (this.state.authenticated !== true) {
			return <Redirect to="/" />
		} else {
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
						<div className="col-lg-3">
                    		<FileUpload onUploadSuccess={this.onUploadSuccess}/>
                		</div> 
						<TemplateLogTable id={this.id}/>
					</div>
				</div>
				</div>
			);
		}


	}
}

export default HomePage