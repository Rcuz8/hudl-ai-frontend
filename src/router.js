import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom';

import Navigation from './flow/nav';
import LandingPage from './flow/landing';
import SignInPage from './flow/signin';
import HomePage from './flow/home';
import AccountPage from './flow/account';
import NewGameAnalysisPage from './flow/nga';
import NewModelPage from './flow/nmp';
import NewClientPage from './flow/nc';
 
import {ROUTES,URLs} from './helpers/constants';
import Axios from 'axios';


const App = React.memo((props) => {

  // console.log(JSON.stringify(props))

  console.log('Render router')

  const isAdmin = props.isAdmin
  const user = props.user
  

  const fbpage = (cls) => 
    cls({...props})

  const Home = ({ match }) => fbpage(HomePage)
  const Land = ({ match }) => fbpage(LandingPage)
  const Acct = ({ match }) => fbpage(AccountPage)
  const SignIn = ({ match }) => fbpage(SignInPage)
  const NGA = ({ match }) => fbpage(NewGameAnalysisPage)
  const NM = ({ match }) => fbpage(NewModelPage)
  const NC = ({ match }) => fbpage(NewClientPage)

  const routes = 
    user ? isAdmin ?
      <>
        <Route exact path={ROUTES.LANDING} component={Land}/>
        <Route path={ROUTES.SIGN_IN} component={SignIn}/>
        <Route path={ROUTES.HOME} component={Home}/>
        <Route path={ROUTES.ACCOUNT} component={Acct}/>
        <Route path={ROUTES.NEW_GAME_ANALYSIS} component={NGA}/>
        <Route path={ROUTES.NEW_MODEL} component={NM}/>
        <Route path={ROUTES.NEW_CLIENT} component={NC}/>
      </>
      :
      <>
        <Route exact path={ROUTES.LANDING} component={Land}/>
        <Route path={ROUTES.SIGN_IN} component={SignIn}/>
        <Route path={ROUTES.HOME} component={Home}/>
        <Route path={ROUTES.ACCOUNT} component={Acct}/>
      </>
      :
      <>
        <Route exact path={ROUTES.LANDING} component={Land}/>
        <Route path={ROUTES.SIGN_IN} component={SignIn}/>
      </>
   
  return <Router>
    
      <div>
        {isAdmin ? <h2>Viewing as Admin</h2> : null}
        <Navigation authUser={user} isAdmin={isAdmin} firebase={props.firebase}/>
  
        <hr />
  
        { routes }
      </div>
    </Router>


});
 
export default App;