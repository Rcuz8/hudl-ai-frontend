import React, { useState, useRef } from "react";
import { withRouter } from "react-router-dom";
import {NavigationSplash as Navigation} from "./nav";
import "./styles/landing.css";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import BuildIcon from "@material-ui/icons/Build";
import EmailIcon from "@material-ui/icons/Email";
import PhoneIcon from "@material-ui/icons/Phone";
import TimelineIcon from "@material-ui/icons/Timeline";
import Engine from "../img/multi_models.png";
import Flow from "../img/app_flow.jpg";
import DQ from "../img/data_quality.png";
import { Tabs, Tab } from "react-bootstrap";
import ParticlesBg from 'particles-bg'


export default withRouter(function Landing(props) {
  var user = props.user;
  var fb = props.firebase;
  var adm = props.isAdmin;

  let refs = [useRef(null), useRef(null), useRef(null)]

  return (
    <div>
      <div class="ld-container">

        <div class="ld-cutout"></div>
        <div class="ld-content-wrap">
        <ParticlesBg type="circle" bg={true} />

          <div class="ld-content">

            <Navigation user={user} refs={refs} />

            <div class="ld-jumbotron">
            

              <h1>
                Power your Game. <br />{" "}
                <span style={{ fontWeight: "bold" }}>With AI.</span>
              </h1>
              <div class="ld-hr" />
              <p>
                World-class predictive tools for the intelligent Defensive
                Coordinator.
              </p>
            </div>
            <div class="ld-core">
              <div class="ld-split" ref={refs[0]}>
                <div>
                  <div class="ld-flex">
                    <div>
                      <TimelineIcon style={{ fontSize: "40px" }} />
                    </div>
                    <div>
                      <div>Power</div>
                    </div>
                  </div>
                  <p>
                    A flexible, powerful suite of game-time prediction tools.
                  </p>
                </div>
                <div>
                  <div class="ld-flex">
                    <div>
                      <BuildIcon style={{ fontSize: "40px" }} />
                    </div>
                    <div>
                      <div>Customization</div>
                    </div>
                  </div>
                  <p>
                    Regular Delivery of a Opponent-specific predictive models.
                  </p>
                </div>
                <div>
                  <div class="ld-flex">
                    <div>
                      <AccessTimeIcon style={{ fontSize: "40px" }} />
                    </div>
                    <div>
                      <div>Simplicity</div>
                    </div>
                  </div>
                  <p>
                    A simplistic, fast-paced interface for making complex
                    game-time decisions.
                  </p>
                </div>
              </div>
              <br />
              <br />
              <br />
              <h2 ref={refs[1]}>Products &#38; Services</h2>
              <div class="ld-ps-hr" />
              <h3>Products</h3>
              <p>Multi-level Game-time prediction engine</p>
              <img src={Engine} />
              <p>Data Quality Analytics</p>
              <img src={DQ} />
              <br />
              <br />
              <h3>Services</h3>
              <div>
                <Tabs className="tabs-dk" defaultActiveKey="data">
                  <Tab eventKey="data" title="Data">
                    <div class="ld-services">
                      <ul>
                        <li>Retrieval</li>
                        <li>
                          Handling
                          <ul>
                            <li>Configuration</li>
                            <li>Imputation</li>
                            <li>Contextualization</li>
                          </ul>
                        </li>
                        <li>Analysis</li>
                      </ul>
                    </div>
                  </Tab>
                  <Tab eventKey="ai" title="AI">
                    <div class="ld-services">
                      <ul>
                        <li>
                          Custom multi-layered predictive models delivered on a
                          regular basis
                        </li>
                        <li>
                          Model Strength Evaluations for each model delivered.
                        </li>
                      </ul>
                    </div>
                  </Tab>
                  <Tab eventKey="gameday" title="Game Day Prep">
                    <div class="ld-services">
                      <ul>
                        <li>
                          Individually-tailored, data-driven feedback on both
                          data and model qualities and accuracies.
                        </li>
                        <li>
                          Trends delivered to players can be pulled directly
                          from the Game Time section upon synchronization
                          between your film and your models.
                        </li>
                        <li>
                          Open dialogue during Analysis creation process to
                          ensure only important and relevent information is
                          being considered.
                        </li>
                      </ul>
                    </div>
                  </Tab>
                </Tabs>
              </div>
              <br />
              <br />
              <img src={Flow} style={{ width: "100%", maxWidth: '1200px' }} />
              <br />
              <br />
              <h3  ref={refs[2]}>Contact</h3>
              <div class='ld-contact'>
              <p>Ryan Cocuzzo</p>
              <a href="mailto:ryan.cocuzzo@gmail.com"><EmailIcon /></a>
              <a href="tel:9086421391"><PhoneIcon /></a>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
