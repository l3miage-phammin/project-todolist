import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(public authFire: AngularFireAuth) {}
  
  private user$ = this.authFire.user; 
  login():Promise<firebase.auth.UserCredential> {
    return this.authFire.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }
  logout() {
    this.authFire.signOut();
  }

  getCurrentUser(){
    return this.user$
  }


}
