import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { TodolistService } from './todolist.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  user$? : Observable<any>;
  user: any;
  constructor(public auth: AuthService, private todoService: TodolistService) {
    this.user$ = this.auth.getCurrentUser();
    this.user$.subscribe((user)=>{
      this.user= user
      if (!!this.user){
        this.todoService.findUserDatabase(this.user.uid);
      }
    })
  }
  
  logOut(){
    this.auth.logout();
    this.todoService.subs.unsubscribe()

  }
  
  login() {
    this.auth.login();
 

  }
}
