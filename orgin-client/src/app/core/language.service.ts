import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  constructor(private http: HttpClient) {}

  public getTranslations(language: string): Observable<any> {
    console.log(`Fetching translations for: ${language}`);
    return this.http.get(`/i18n/${language}.json`);
  }
}
