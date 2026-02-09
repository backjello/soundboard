import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Audio, AudioPlayResponse, AudioUploadRequest } from '../models/audio.model';

export function getAuthHeaders(): HttpHeaders {
  const token = localStorage.getItem('token');
  return new HttpHeaders({
    'Authorization': token ? `Bearer ${token}` : ''
  });
}
@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private apiUrl = environment.apiUrl || 'http://localhost:3333';

  constructor(private http: HttpClient) { }


  getAudioList(search?: string, favoritesOnly?: boolean): Observable<Audio[]> {
    let params = new URLSearchParams();
    if (search) {
      params.append('search', search);
    }
    if (favoritesOnly) {
      params.append('favorites', 'true');
    }

    const url = params.toString() ? `${this.apiUrl}/audio?${params.toString()}` : `${this.apiUrl}/audio`;

    return this.http.get<Audio[]>(url, {
      headers: getAuthHeaders()
    });
  }

  getAudio(id: number): Observable<Audio> {
    return this.http.get<Audio>(`${this.apiUrl}/audio/${id}`, {
      headers: getAuthHeaders()
    });
  }

  playAudio(filename: string): Observable<AudioPlayResponse> {
    return this.http.get<AudioPlayResponse>(`${this.apiUrl}/audio/play/${filename}`, {
      headers: getAuthHeaders()
    });
  }

  uploadAudio(audioData: AudioUploadRequest): Observable<any> {
    const formData = new FormData();
    formData.append('name', audioData.name);
    formData.append('file', audioData.file);

    return this.http.post(`${this.apiUrl}/audio`, formData, {
      headers: getAuthHeaders()
    });
  }

  renameAudio(id: number, name: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/audio/${id}`, { name }, {
      headers: getAuthHeaders()
    });
  }

  addToFavorites(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/audio/${id}/favorite`, {}, {
      headers: getAuthHeaders()
    });
  }

  removeFromFavorites(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/audio/${id}/favorite`, {
      headers: getAuthHeaders()
    });
  }

  deleteAudio(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/audio/${id}`, {
      headers: getAuthHeaders()
    });
  }
}
