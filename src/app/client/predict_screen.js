import React, { useState } from "react";
import "./predict_screen.css";
import { ProgressBar } from "react-bootstrap";

const capitalize = s => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// // Percent format
// const mrd = pc => Math.round(pc * 100) + "%";

// Sample Response Info
const SRIs = [
  {
    name: "I Form",
    prob: 0.25,
    run_prob: 0.55,
    plays: [
      { name: "toss", prob: 0.15 },
      { name: "sweep", prob: 0.12 },
      { name: "jet", prob: 0.1 }
    ]
  },
  {
    name: "Wing T",
    prob: 0.15,
    run_prob: 0.74,
    plays: [
      { name: "dive trap", prob: 0.27 },
      { name: "sweep", prob: 0.18 },
      { name: "jet", prob: 0.13 }
    ]
  },
  {
    name: "Spread",
    prob: 0.08,
    run_prob: 0.35,
    plays: [
      { name: "hitches", prob: 0.15 },
      { name: "sweep", prob: 0.12 },
      { name: "jet", prob: 0.1 }
    ]
  }
];

/*
  // Sample Play Info
  const PIs = [
    {
      type: "run",
      name: "toss",
      prob: 0.65
    },
    {
      type: "pass",
      name: "verts",
      prob: 0.55
    },
    {
      type: "run",
      name: "toss",
      prob: 0.4
    }
  ];
*/
// Sample Formation info  -> Same format as SRIs (superset)
const FIs = SRIs;

export default function Predict_screen(props) {
  const [form, setForm] = useState(FIs[0]);
  const [scoreUs, setScoreUs] = useState(0);
  const [scoreThem, setScoreThem] = useState(0);
  const [dn, setdn] = useState(1);
  const [ydln, setydln] = useState(50);
  const [dist, setdist] = useState(10);
  const [qtr, setqtr] = useState(1);

  const get_run = () => {
    if (form == null) return <div> Waiting on formation selection.. </div>;
    else
      return (
        <div>
          {/* Results */}
          <div class="lt-run-time-header">
            <div>RUN</div>
            <div>{Math.round(form.run_prob * 100)}%</div>
            <div>PASS</div>
            <div>{100 - Math.round(form.run_prob * 100)}%</div>
          </div>
          <div class="wider">Top 3 Plays</div>
          {form.plays.map(play => (
            <div class="lt-run-time-data">
              <div>{capitalize(play.name)}</div>
              <ProgressBar
                now={Math.round(play.prob * 100)}
                style={{ height: "25px" }}
              />
            </div>
          ))}
        </div>
      );
  };

  const changeFormation = toName => {
    setForm(FIs.filter(form => form.name === toName)[0]);
  };

  const generate_prediction = () => {};

  return (
    <div class="lt-grid-container">
      <div class="wider">
        <h2>Configure</h2>
      </div>
      <div class="lt-score">
        <div>US</div>
        <div>THEM</div>
        <input
          class="input-box"
          name="score-us"
          onChange={ev => setScoreUs(ev.target.value)}
          type="number"
          value={scoreUs}
        />
        <input
          class="input-box"
          name="score-them"
          onChange={ev => setScoreThem(ev.target.value)}
          type="number"
          value={scoreThem}
        />
        <div>QUARTER</div>
        <select class="input-box" onChange={ev => setqtr(ev.target.value)}>
          {[1, 2, 3, 4].map(item => (
            <option value={item}>{item}</option>
          ))}
        </select>
      </div>
      <div class="lt-scenario">
        <div>DOWN</div>
        <select class="input-box" onChange={ev => setdn(ev.target.value)}>
          {[1, 2, 3, 4].map(item => (
            <option value={item}>{item} </option>
          ))}
        </select>
        <div>DISTANCE</div>
        <input class="input-box" onChange={ev => setdist(ev.target.value)} />
        <div>YD LN</div>
        <input class="input-box" onChange={ev => setydln(ev.target.value)} />
      </div>
      <div class="wider">
        <button onClick={() => generate_prediction()}>Generate</button>
        <h2 style={{ marginTop: "20px" }}>Analyze</h2>
      </div>
      <div class="lt-prediction">
        <div class="lt-prediction-header">PRE-ALIGNMENT</div>
        <div class="lt-prediction-data">
          <div>FORM</div>
          <div>TYPE</div>
          <div>PLAY</div>
        </div>
        {SRIs.map(item => (
          <div class="lt-prediction-data">
            <div>
              <div>
                {item.name} ({Math.round(item.prob * 100)}%)
              </div>
            </div>
            <div>
              <div>Pass ({100 - Math.round(item.run_prob * 100)}%)</div>
              <div>Run ({Math.round(item.run_prob * 100)}%)</div>
            </div>
            <div>
              {item.plays.map(play => (
                <div>
                  {capitalize(play.name)} ({Math.round(play.prob * 100)}%)
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div class="lt-run-time">
        <div>POST-ALIGNMENT</div>
        <div class="lt-run-time-header">
          <div>FORMATION</div>
          <select
            class="input-box wide-box"
            onChange={opt => changeFormation(opt.target.value)}
          >
            {["I Form", "Wing T"].map(item => (
              <option value={item}>{item}</option>
            ))}
          </select>
        </div>
        {get_run()}
        <div class="wider">
          <button>RESET</button>
        </div>
      </div>
    </div>
  );
}
