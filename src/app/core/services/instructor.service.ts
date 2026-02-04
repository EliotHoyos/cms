import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InstructorResponse, InstructorRequest } from '../models/instructor.model';

// Re-exporta para que los imports existentes no se rompen durante la migración
export { InstructorResponse, InstructorRequest };

@Injectable({
  providedIn: 'root'
})
export class InstructorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/instructors`;

  getInstructors(): Observable<InstructorResponse[]> {
    return this.http.get<InstructorResponse[]>(this.apiUrl);
  }

  createInstructor(instructor: InstructorRequest): Observable<{ Succes: string }> {
    const formData = new FormData();
    formData.append('photo', instructor.photo);
    formData.append('name', instructor.name);
    formData.append('last_name', instructor.last_name);
    formData.append('specialty', instructor.specialty);
    formData.append('belt_level', instructor.belt_level);
    if (instructor.bio) formData.append('bio', instructor.bio);
    formData.append('email', instructor.email);
    formData.append('phone', instructor.phone);
    formData.append('experience_years', instructor.experience_years.toString());
    if (instructor.certifications) formData.append('certifications', instructor.certifications);
    if (instructor.social_media_facebook) formData.append('social_media_facebook', instructor.social_media_facebook);
    if (instructor.social_media_instagram) formData.append('social_media_instagram', instructor.social_media_instagram);
    if (instructor.social_media_twitter) formData.append('social_media_twitter', instructor.social_media_twitter);
    if (instructor.status) formData.append('status', instructor.status);

    return this.http.post<{ Succes: string }>(this.apiUrl, formData);
  }

  updateInstructor(id: number, instructor: InstructorRequest): Observable<{ message: string }> {
    const formData = new FormData();
    if (instructor.photo) formData.append('photo', instructor.photo);
    formData.append('name', instructor.name);
    formData.append('last_name', instructor.last_name);
    formData.append('specialty', instructor.specialty);
    formData.append('belt_level', instructor.belt_level);
    if (instructor.bio) formData.append('bio', instructor.bio);
    formData.append('email', instructor.email);
    formData.append('phone', instructor.phone);
    formData.append('experience_years', instructor.experience_years.toString());
    if (instructor.certifications) formData.append('certifications', instructor.certifications);
    if (instructor.social_media_facebook) formData.append('social_media_facebook', instructor.social_media_facebook);
    if (instructor.social_media_instagram) formData.append('social_media_instagram', instructor.social_media_instagram);
    if (instructor.social_media_twitter) formData.append('social_media_twitter', instructor.social_media_twitter);
    if (instructor.status) formData.append('status', instructor.status);

    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, formData);
  }

  activateInstructor(id: number, instructor: InstructorResponse): Observable<{ message: string }> {
    const formData = new FormData();
    formData.append('name', instructor.name);
    formData.append('last_name', instructor.last_name);
    formData.append('specialty', instructor.specialty);
    formData.append('belt_level', instructor.belt_level);
    if (instructor.bio) formData.append('bio', instructor.bio);
    formData.append('email', instructor.email);
    formData.append('phone', instructor.phone);
    formData.append('experience_years', instructor.experience_years.toString());
    if (instructor.certifications) formData.append('certifications', instructor.certifications);
    if (instructor.social_media_facebook) formData.append('social_media_facebook', instructor.social_media_facebook);
    if (instructor.social_media_instagram) formData.append('social_media_instagram', instructor.social_media_instagram);
    if (instructor.social_media_twitter) formData.append('social_media_twitter', instructor.social_media_twitter);
    formData.append('status', 'active');

    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, formData);
  }

  deactivateInstructor(id: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${id}/inactivar`, {});
  }

  publishInstructor(id: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${id}/publish`, {});
  }

  unpublishInstructor(id: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${id}/unpublish`, {});
  }
}
