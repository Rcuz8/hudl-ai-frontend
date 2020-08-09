import React, { useState, useEffect } from "react";
import { withRouter, NavLink } from "react-router-dom";
import * as con from "../helpers/constants";
import { games as testgames } from "../test/testdata";
import './styles/home.css'
const TEST_MODE = con.TEST_MODE;

function Home(props) {
  const UID = props.user.uid;

  const [games, setGames] = useState(null);

  useEffect(() => {
    if (TEST_MODE) {
      const run = async () => {
        setGames(filter_games(testgames));
      };
      run();
    } else {
      con.games_get(UID).then((response) => {
        setGames(filter_games(response["data"]));
      });
    }
  }, [setGames]);

  const filter_games = (games) => {
    return games.filter((game) => !!game.training_info);
  };

  const c_Games = games
    ? games.map((game) => (
        <div>
          {game.name}{" "}
          <span style={{ paddingLeft: "5px", color: "grey", float: "right" }}>
            (
            {new Date(game.created).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
            )
          </span>
        </div>
      ))
    : null;

  return (
    <div class='hm-view'>
      <div style={{ width: "600px", margin: "auto" }}>
          <h3 style={{ textAlign: "left", fontWeight: "bold", margin: "10px" }}>
            Go To.
          </h3>
          <div class="list-with-shadow-items lt-split">
          <NavLink to={con.ROUTES.PREDICT} 
          style={{color: 'black', textDecoration: 'none', textAlign: 'center'}}>Game</NavLink>
          <NavLink to={con.ROUTES.DATA_QUALITY}
          style={{color: 'black', textDecoration: 'none', textAlign: 'center'}}>Data</NavLink>
          </div>
        </div>
        <div style={{ width: "600px", margin: "auto" }}>
          <h3 style={{ textAlign: "left", fontWeight: "bold", margin: "10px" }}>
            Recent Prediction Models.
          </h3>
          <div class="list-with-shadow-items">{c_Games}</div>
        </div>
    </div>
  );
}

export default withRouter(Home);
