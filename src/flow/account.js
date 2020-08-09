import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import * as con from "../helpers/constants";
import "./styles/account.css";

function Account(props) {
  const UID = props.user.uid;
  const EMAIL = props.user.email;
  const [teamName, setteamname] = useState(null);
  const [userName, setusername] = useState(null);

  useEffect(() => {
    if (con.TEST_MODE) {
      setteamname("TEST TEAM ABC NAMEEEEEEEE NAMEEEEEEEE");
      setusername("TEST USER NAMEEEEEEEE NAMEEEEEEEEEEE");
    } else {
      con.socket_get(con.URLs.PY_USERINFO, UID).then((res) => {
        const db_profile = res.data;

        setusername(db_profile["name"]);
        setteamname(db_profile["team_name"]);
      });
    }
  }, [setteamname, setusername]);

  return (
    <div class="acct-view">
      <div>
        <h3>Account</h3>
        <div>
          <div class="acct-grid">
            <div>
              <div>
                <strong>Team Name</strong>
              </div>
              <div>
                <strong>Name</strong>
              </div>
              <div>
                <strong>Email</strong>
              </div>
            </div>
            <div>
              <div>{teamName}</div>
              <div>{userName}</div>
              <div>{EMAIL}</div>
            </div>
          </div>
          <br />
          <br />
          <button class="stdbtn" onClick={() => props.db.doSignOut()}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default withRouter(Account);
