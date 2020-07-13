import React from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import styles from './styles/nav.module.css'
import { ROUTES } from '../helpers/constants';
 
const Navigation = ({ authUser, isAdmin, firebase }) => (
  <div>{authUser ? <NavigationAuth isAdmin={isAdmin} db={firebase}/> : <NavigationNonAuth />}</div>
);

const active_item = {
  fontWeight: "bold",
  color: "white",
  backgroundColor: 'black',
}
 
const NavigationAuth = (props) => (
  props.isAdmin ? 
  <ul class={styles.navbar}>
    <li>
      <NavLink exact activeStyle={active_item} to={ROUTES.LANDING}>Landing</NavLink>
    </li>
    <li>
      <NavLink activeStyle={active_item} to={ROUTES.HOME}>Home</NavLink>
    </li>
    <li>
      <NavLink activeStyle={active_item} to={ROUTES.ACCOUNT}>Account</NavLink>
    </li>
    <li>
      <NavLink activeStyle={active_item} to={ROUTES.NEW_GAME_ANALYSIS}>New Game Analysis</NavLink>
    </li>
    <li>
      <NavLink activeStyle={active_item} to={ROUTES.NEW_MODEL}>New Model</NavLink>
    </li>
    <li>
      <NavLink activeStyle={active_item} to={ROUTES.NEW_CLIENT}>New Client</NavLink>
    </li>
    <li>
      <button onClick={() => props.db.doSignOut()}>Sign Out</button>
    </li>
  </ul>
  :
  <ul>
    <li>
      <NavLink exact activeStyle={active_item} to={ROUTES.LANDING}>Landing</NavLink>
    </li>
    <li>
      <NavLink activeStyle={active_item} to={ROUTES.HOME}>Home</NavLink>
    </li>
    <li>
      <NavLink activeStyle={active_item} to={ROUTES.ACCOUNT}>Account</NavLink>
    </li>
    <li>
      <NavLink activeStyle={active_item} to={ROUTES.DATA_QUALITY}>Data Quality</NavLink>
    </li>
    <li>
      <button activeStyle={active_item} onClick={() => props.db.doSignOut()}>Sign Out</button>
    </li>
  </ul>
);
 
const NavigationNonAuth = () => (
  <ul>
    <li>
      <NavLink exact activeStyle={active_item} to={ROUTES.LANDING}>Landing</NavLink>
    </li>
    <li>
      <NavLink activeStyle={active_item} to={ROUTES.SIGN_IN}>Sign In</NavLink>
    </li>
  </ul>
);
 
export default withRouter(Navigation);