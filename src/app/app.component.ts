import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from './auth/auth.service';
import { users } from './auth/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'angular-kart';
  currentUser: users | null = null;

  constructor(
    private router: Router,
    private authenticationService: AuthService
  ) {
    // this.authenticationService.currentUser.subscribe(
    //   (x) => (this.currentUser = x)
    // );
  }

  // logout() {
  //   this.authenticationService.logout();
  //   this.router.navigate(['/login']);
  // }
}
