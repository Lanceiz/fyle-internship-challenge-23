// 1) It checks if the request is a GET request suitable for caching.
// 2) If it's a GET request, it checks if a cached response already exists for the specific URL with parameters.
// 3) If a cached response exists, it returns that cached response as an observable.
// 4) If no cached response exists, it forwards the request to the next handler (typically the HttpClient).
// 5) Upon receiving a successful response from the server, it caches a clone of the response in the cache map for future use.
 

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  //creates a Map which will store cached HTTP responses. Key for each entry in the map is a string representing the request URL
  private cache = new Map<string, HttpResponse<any>>();

  // It is the core method of the interceptor. It implements the intercept method from the HttpInterceptor interface.
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // Check if the request is cacheable
    if (!req.method || req.method !== 'GET') {
      return next.handle(req);
    }

    // Check if the response is cached
    const cachedResponse = this.cache.get(req.urlWithParams);
    if (cachedResponse) {
      return of(cachedResponse.clone());  //If a cached response exists, just return it's clone
    }

    // Forward the request to the next handler
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          // Cache the response
          this.cache.set(req.urlWithParams, event.clone());
        }
      })
    );
  }
}
