import { enableProdMode, importProvidersFrom } from '@angular/core';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';
import { bootstrapApplication } from '@angular/platform-browser';
import 'zone.js';
import { AppComponent } from './app/app.component';

// compat imports (provide the 'angularfire2.app.options' token)
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  // keep the existing appConfig providers (router, modular firebase, etc.)
  // and also add compat providers so angular-fire-compat works
  providers: [
    ...(appConfig.providers ?? []),
    importProvidersFrom(
      AngularFireModule.initializeApp(environment.firebase),
      AngularFireAuthModule,
      AngularFirestoreModule
    ),
  ],
}).catch(err => console.error(err));