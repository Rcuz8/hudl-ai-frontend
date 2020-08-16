import React, { useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Navigation from "./flow/nav";
import LandingPage from "./flow/landing";
import SignInPage from "./flow/signin";
import HomePage from "./flow/home";
import AccountPage from "./flow/account";
import NewGameAnalysisPage from "./flow/nga";
import NewModelPage from "./flow/nmp";
import NewClientPage from "./flow/nc";
import DataQualityPage from "./flow/data_quality";
import PredictScreenPage from "./app/client/predict_screen";

import { ROUTES } from "./helpers/constants";

const App = React.memo((props) => {
  console.log("Render router");

  var isAdmin = props.isAdmin;
  var user = props.user;

  const fbpage = (cls) => cls({ ...props });

  const Home = ({ match }) => fbpage(HomePage);
  const Land = ({ match }) => fbpage(LandingPage);
  const Acct = ({ match }) => fbpage(AccountPage);
  const SignIn = ({ match }) => fbpage(SignInPage);
  const NGA = ({ match }) => fbpage(NewGameAnalysisPage);
  const NM = ({ match }) => fbpage(NewModelPage);
  const NC = ({ match }) => fbpage(NewClientPage);
  const DQ = ({ match }) => fbpage(DataQualityPage);
  const PS = ({ match }) => fbpage(PredictScreenPage);

  const routes = user ? (
    isAdmin ? (
      <Switch>
        <Route exact path={ROUTES.LANDING} component={Land} />
        <Route exact path={ROUTES.SIGN_IN} component={SignIn} />
        <Route exact path={ROUTES.ACCOUNT} component={Acct} />
        <Route exact path={ROUTES.NEW_GAME_ANALYSIS} component={NGA} />
        <Route exact path={ROUTES.NEW_MODEL} component={NM} />
        <Route exact path={ROUTES.NEW_CLIENT} component={NC} />
        <Route exact path={ROUTES.DATA_QUALITY} component={DQ} />
        <Route exact path={ROUTES.PREDICT} component={PS} />
        <Route component={Home} />
      </Switch>
    ) : (
      <Switch>
        <Route exact path={ROUTES.LANDING} component={Land} />
        <Route exact path={ROUTES.ACCOUNT} component={Acct} />
        <Route exact path={ROUTES.DATA_QUALITY} component={DQ} />
        <Route exact path={ROUTES.PREDICT} component={PS} />
        <Route component={Home} />
      </Switch>
    )
  ) : (
    <Switch>
      <Route exact path={ROUTES.SIGN_IN} component={SignIn} />
      <Route component={Land} />
    </Switch>
  );

  // // TEST
  // user = null
  // isAdmin = false

  return (
    <Router>
      <div>
        {isAdmin && <h2 style={{ margin: "10px" }}>Viewing as Admin</h2>}
        {user && (
          <Navigation
            authUser={user}
            isAdmin={isAdmin}
            firebase={props.firebase}
          />
        )}
        {routes}
      </div>
    </Router>
  );
});

export default App;
