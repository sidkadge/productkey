import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/api.service';

@Injectable({
  providedIn: 'root'  // This makes the service available application-wide
})
export class AppointmentService {
 
  private baseUrl: string;

  constructor(private http: HttpClient, private apiService: ApiService) {
    this.baseUrl = this.apiService.getBaseUrl();
  }

  getAppointmentsWithSlots(): Observable<any> {
    const url = `${this.baseUrl}/getAppointmentsWithSlots`;
    return this.http.get(url);
  }

  submitPayment(contactId: number, amount: number, received: string): Observable<any> {
    const data = { contactId, amount, received };
    const url = `${this.baseUrl}/api/appointments/payment`; // Ensure the endpoint uses baseUrl
    return this.http.post(url, data);
  }
}
