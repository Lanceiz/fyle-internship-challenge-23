import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Repo } from '../Model/repo';
import { User } from '../Model/user';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private githubUrl = "https://api.github.com";
  //repoCache used for caching repository data to improve performance
  private repoCache: { [key: string]: Repo[] } = {};

  constructor(private http: HttpClient) {}

  // API call to fetch users
  getUser(userName: string): Observable<any> {
    // <User> specifies that the expected response is an object of type User
    //pipe is used to catch any error that might occur during the HTPP request
    return this.http.get<User>(`${this.githubUrl}/users/${userName}`).pipe(
      catchError(this.handleError)
    );
  }

  //API call to fetch repos, and making sure there are no unnecessary API calls with the help of caching 
  getUserRepos(userName: string, page: number = 1, perPage: number = 10): Observable<Repo[]> {
    const cacheKey = `${userName}-${page}-${perPage}`;

    if (this.repoCache[cacheKey]) {
      return of(this.repoCache[cacheKey]);
    } 
    else {
      const apiURL = `${this.githubUrl}/users/${userName}/repos`;

      //sets necessary query parameters for pagination like
      //which page to load? how many repos per_page to load?
      const params = {
        page: page.toString(),
        per_page: perPage.toString()
      };

      //including headers to make a more precise API request
      const headers = new HttpHeaders().set('Accept', 'application/vnd.github.v3+json');
      
      return this.http.get<Repo[]>(apiURL, { params, headers }).pipe(
        map((repos) => {
          this.repoCache[cacheKey] = repos; //first cache the repos, then return them
          return repos;
        }),
        catchError(this.handleError)
      );
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = `Error: ${error.status}`;
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }
  
  
}
