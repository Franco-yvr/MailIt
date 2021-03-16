import './App.css';
import React from "react";
import LoginPage from "./components/login/LoginPage"
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import HomePage from "./components/home-page/HomePage";
import CampaignPage from "./components/CampaignPage";
import UnderConstructionPage from './components/UnderConstructionPage';


function App() {

    return (
        <div>
            <BrowserRouter>
                <Switch>
                    <Route path="/" component={LoginPage} exact/>
                    <Route exact path="/HomePage"><HomePage/></Route>
                    <Route path="/campaignPage/:templateKey" component={CampaignPage}/>
                    <Route path="/UnderConstructionPage"><UnderConstructionPage/></Route>
                </Switch>
            </BrowserRouter>
        </div>
    );
}

export default App
