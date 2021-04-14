import './App.css';

import LoginPage from "./components/login/LoginPage"
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import HomePage from "./components/home-page/HomePage";
import CampaignPage from "./components/campaign-page/CampaignPage";
import CampaignLogTable from "./components/campaign-log-table/CampaignLogTable";
import EmailLogTable from "./components/email-log-table/EmailLogTable";

//Imports that may need to be added back in
//import {useEffect} from "react";
//import useCheckUser from "./components/login/useCheckUser";

function App() {

    //TODO: Need to reimplement the token system to allow app to be used in incognito mode 
    // let { user, checkUser } = useCheckUser();

    // useEffect(() => {
    //     checkUser()
    //     }
    // )

        //TODO: setting true as current code issue. This should be fixed as discussed
        return (
            <div>
                <BrowserRouter>
                    <Switch>
                        
                        <Route path="/" component={LoginPage} exact/>
                        <Route exact path="/HomePage"><HomePage user={true}/></Route>
                        <Route path="/campaignPage/:templateName" 
                               render={(props) => (
                                 <CampaignPage {...props} user={true}/>)
                               }>
                        </Route> 
                        <Route path="/CampaignLogTable" render={(props) => (
                                 <CampaignLogTable {...props} user={true}/>)
                               }>
                        </Route>
                        <Route path="/EmailLogTable" render={(props) => (
                                 <EmailLogTable {...props} user={true}/>)
                               }>
                        </Route>
                    </Switch>
                </BrowserRouter>
            </div>
        );
}

export default App;


