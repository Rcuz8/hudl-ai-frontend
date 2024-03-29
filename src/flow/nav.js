import React from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import styles from './styles/nav.module.css'
import { ROUTES, CompanyName } from '../helpers/constants';
import AlarmIcon from '@material-ui/icons/AccessAlarms';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import StorageIcon from '@material-ui/icons/Storage';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import MovieIcon from '@material-ui/icons/Movie';
import RedditIcon from '@material-ui/icons/Reddit';
import SportsEsportsIcon from '@material-ui/icons/SportsEsports';


const CompanyNameSplit = [CompanyName.substring(0, CompanyName.length -2), CompanyName.substring(CompanyName.length - 2, CompanyName.length)]
const CompanyNameComponent = <h3 class={styles.companyname}>{CompanyNameSplit[0]} <span class={styles.offcolor}>({CompanyNameSplit[1]})</span></h3>;
const Navigation = ({ authUser, isAdmin, firebase }) => (
  <div>{authUser ? <NavigationAuth isAdmin={isAdmin} db={firebase}/> : null}</div>
);

const active_item = {
  fontWeight: "bold",
  color: "var(--color5)",
  backgroundColor: 'black',
}
const NavigationAuth = (props) => (
  props.isAdmin ?
  <ul class={styles.navbar} >
    <li><NavLink to={ROUTES.HOME}>     <span style={{display: 'flex', marginTop: '5px'}}>{CompanyNameComponent}<p class={styles.btag}> ALPHA</p>   </span>                          </NavLink></li>
    <li ><NavLink exact activeStyle={active_item} to={ROUTES.SIGN_IN}>       Sign In                 </NavLink></li>
    <li ><NavLink exact activeStyle={active_item} to={ROUTES.LANDING}>       Landing                 </NavLink></li>
    <li class={styles.toright}><NavLink activeStyle={active_item} to={ROUTES.ACCOUNT}>             <AccountCircleIcon/>                  </NavLink></li>
    <li class={styles.toright}><NavLink activeStyle={active_item} to={ROUTES.DATA_QUALITY}>        <StorageIcon/>              </NavLink></li>
    <li class={styles.toright}><NavLink activeStyle={active_item} to={ROUTES.PREDICT}>             <SportsEsportsIcon/>    </NavLink></li>
    <li class={styles.toright}><NavLink activeStyle={active_item} to={ROUTES.NEW_CLIENT}>          <PersonAddIcon/>         </NavLink></li>
    <li class={styles.toright}><NavLink activeStyle={active_item} to={ROUTES.NEW_MODEL}>           <RedditIcon/>               </NavLink></li>
    <li class={styles.toright}><NavLink activeStyle={active_item} to={ROUTES.NEW_GAME_ANALYSIS}>   <MovieIcon/>       </NavLink></li>
  </ul>
  :
  <ul class={styles.navbar}>
    <li><NavLink to={ROUTES.HOME}>     <span style={{display: 'flex', marginTop: '5px'}}>{CompanyNameComponent}<p class={styles.btag}> ALPHA</p>   </span>                          </NavLink></li>
    <li class={styles.toright}><NavLink activeStyle={active_item} to={ROUTES.ACCOUNT}>             <AccountCircleIcon/>                  </NavLink></li>
    <li class={styles.toright}><NavLink activeStyle={active_item} to={ROUTES.DATA_QUALITY}>        <StorageIcon/>              </NavLink></li>
    <li class={styles.toright}><NavLink activeStyle={active_item} to={ROUTES.PREDICT}>             <SportsEsportsIcon/>    </NavLink></li>
  </ul>
);


export const NavigationSplash = ({user, refs}) => (
  <ul class={styles.navbar + ' ' + styles.nv_hover} style={{color: 'var(--color5)', backgroundColor: 'transparent'}}>
    <li><NavLink to={ROUTES.HOME}>     <span style={{display: 'flex', marginTop: '5px', color: 'var(--color1)'}}>{CompanyNameComponent}<p class={styles.btag}> ALPHA</p>   </span>                          </NavLink></li>
    {!user && <li class={styles.toright}><NavLink class='navhov' activeStyle={active_item} to={ROUTES.SIGN_IN}>             Sign In                  </NavLink></li>}
    {user && <li class={styles.toright}><NavLink class='navhov' activeStyle={active_item} to={ROUTES.SIGN_IN}>             Home                  </NavLink></li>}
    <li class={styles.toright} onClick={() => scrollToRef(refs[2])}>Contact</li>
    <li class={styles.toright} onClick={() => scrollToRef(refs[1])}>Products &#38; Services</li>
    <li class={styles.toright} onClick={() => scrollToRef(refs[0])}>About Us</li>
  </ul>
);

export const NavigationSignin = () => (
  <ul class={styles.navbar}>
    <li><NavLink to={ROUTES.HOME}>
        <span style={{display: 'flex', marginTop: '5px'}}>
            {CompanyNameComponent}
            <p class={styles.btag}> ALPHA</p>
        </span>
        </NavLink></li>
  </ul>
);

const scrollToRef = (ref) => window.scrollTo({top: ref.current.offsetTop, behavior: 'smooth'})


export default withRouter(Navigation);
