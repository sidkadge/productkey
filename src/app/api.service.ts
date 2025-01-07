import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',  // This ensures that ApiService is available globally
})
export class ApiService {
  private baseUrl = 'http://localhost/OPDAdminPanal'; // Replace with your API base URL

  constructor(private http: HttpClient) {}

  /**
   * GET method
   * @param endpoint The API endpoint
   * @returns Observable
   */
  get(endpoint: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${endpoint}`);
  }

  /**
   * POST method
   * @param endpoint The API endpoint
   * @param data The data to post
   * @returns Observable
   */
 
  post(endpoint: string, data: any, options?: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${endpoint}`, data, options);
  }  
  
  getBaseUrl(): string {
    return this.baseUrl;
  }
}


//confiig={
// "getRegData":"createcunsltant/tbl_register/"
//}