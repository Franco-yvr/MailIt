import './App.css';
import {useEffect} from "react";
import LoginPage from "./components/login/LoginPage"
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import HomePage from "./components/home-page/HomePage";
import CampaignPage from "./components/CampaignPage";
import CampaignLogTable from "./components/CampaignLogTable";
import EmailLogTable from "./components/EmailLogTable";
import UnderConstructionPage from './components/UnderConstructionPage';
import useCheckUser from "./components/login/useCheckUser";

function App() {

    let { user, checkUser } = useCheckUser();

    useEffect(() => {
        checkUser()
        }
    )

        return (
            <div>
                <BrowserRouter>
                    <Switch>
                        //TODO: setting true as current code issue. This should be fixed as discussed
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
                        <Route path="/UnderConstructionPage" render={(props) => (
                                 <UnderConstructionPage {...props} user={true}/>)
                               }>
                        </Route>
                    </Switch>
                </BrowserRouter>
            </div>
        );
}

export default App;


