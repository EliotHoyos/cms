import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClientResponse {
  id: number;
  name: string;
  last_name: string;
  document_type: 'DNI' | 'RUC';
  document: string;
  address: string;
  cellphome: string;
  email: string;
  gender: string;
  birthday: string;
  photo: string;
}

export interface ClientRequest {
  name: string;
  last_name: string;
  document_type: 'DNI' | 'RUC';
  document: string;
  address: string;
  cellphome: string;
  email: string;
  gender: string;
  birthday: string;
  photo: File;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/clients';

  getClients(): Observable<ClientResponse[]> {
    return this.http.get<ClientResponse[]>(this.apiUrl);
  }

  createClient(client: ClientRequest): Observable<{ Succes: string }> {
    const formData = new FormData();
    formData.append('photo', client.photo);
    formData.append('name', client.name);
    formData.append('last_name', client.last_name);
    formData.append('document_type', client.document_type);
    formData.append('document', client.document);
    formData.append('address', client.address);
    formData.append('cellphome', client.cellphome);
    formData.append('email', client.email);
    formData.append('gender', client.gender);
    formData.append('birthday', client.birthday);

    return this.http.post<{ Succes: string }>(this.apiUrl, formData);
  }
}
