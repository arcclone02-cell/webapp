import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { from, Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  getUserId: any;
  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore
  ) {}

  // Sign in with email/password. Returns an Observable that resolves with the user credential.
  login(email: string, password: string): Observable<any> {
    return from(this.afAuth.signInWithEmailAndPassword(email, password));
  }

  // Register new user, update Firebase Auth profile (displayName), then create a Firestore document for the user
  register(name: string, email: string, password: string): Observable<any> {
    return from(this.afAuth.createUserWithEmailAndPassword(email, password)).pipe(
      // userCredential is the result of creating the user
      switchMap((userCredential) => {
        const user = userCredential.user;
        if (!user) {
          return of(userCredential);
        }

        // First update the Firebase Auth profile (displayName)
        return from(user.updateProfile({ displayName: name })).pipe(
          // After updating profile, create Firestore user document
          switchMap(() => {
            const uid = user.uid;
            const userDocRef = this.afs.doc(`users/${uid}`);
            const userData = {
              displayName: name,
              email: email,
              role: 'user', // default role - do NOT set 'admin' from client in production
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            };
            return from(userDocRef.set(userData)).pipe(map(() => userCredential));
          })
        );
      })
    );
  }
  // forget password
  forgotPassword(email: string): Observable<void> {
    return from(this.afAuth.sendPasswordResetEmail(email));
  }
  // Sign out
  logout(): Promise<void> {
    return this.afAuth.signOut();
  }
}