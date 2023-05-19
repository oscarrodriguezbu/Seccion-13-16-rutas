import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, tap, of, map, catchError } from 'rxjs';

import { environments } from '../../../environments/environments';
import { User } from '../interfaces/user.interface';

@Injectable({providedIn: 'root'})
export class AuthService {

  private baseUrl = environments.baseUrl;
  private user?: User; //opcional porque puede llegar nulo

  constructor(private http: HttpClient) { }

  get currentUser():User|undefined { //el get expone propiedades privadas sin alterar el original
    if ( !this.user ) return undefined;
    return structuredClone( this.user ); //structuredClone viene de js para hacer un clone. Tambien se pudo haber usado el operoador ...this.users
  }

  login( email: string, password: string ):Observable<User> {
    // http.post('login',{ email, password });
    return this.http.get<User>(`${ this.baseUrl }/users/1`)
      .pipe(
        //cada pipe depe tener un proceso
        tap( user => this.user = user ),
        tap( user => localStorage.setItem('token', 'aASDgjhasda.asdasd.aadsf123k' )),
      );
  }

  checkAuthentication(): Observable<boolean> {

    if ( !localStorage.getItem('token') ) return of(false);

    const token = localStorage.getItem('token');

    return this.http.get<User>(`${ this.baseUrl }/users/1`)
      .pipe(
        tap( user => this.user = user ),
        map( user => !!user ), // doble negacion es para asegurar que llegue un booleanoS
        catchError( err => of(false) )
      );

  }


  logout() {
    this.user = undefined;
    localStorage.clear();
  }



}
