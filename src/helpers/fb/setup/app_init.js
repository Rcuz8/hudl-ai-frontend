import app from 'firebase/app';
import 'firebase/auth';
 
const config = {
  apiKey: "AIzaSyDKxaK0QVq7symfg5G703qj7OXlINm7MfY",
  authDomain: "hudpred.firebaseapp.com",
  databaseURL: "https://hudpred.firebaseio.com",
  projectId: "hudpred",
  storageBucket: "hudpred.appspot.com",
  messagingSenderId: "882772259819",
  appId: "1:882772259819:web:5e7cedd08d4f8ed6499fae",
  measurementId: "G-76Z2YNMF8M"
};
 
class Firebase {
  constructor() {
    app.initializeApp(config);
 
    this.auth = app.auth();
  }
 
  // *** Auth API ***
 
  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);
 
  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);
 
  doSignOut = () => this.auth.signOut();

  doPasswordReset = email => this.auth.sendPasswordResetEmail(email);
 
  doPasswordUpdate = password =>
    this.auth.currentUser.updatePassword(password);
    
}
 
export default Firebase;

