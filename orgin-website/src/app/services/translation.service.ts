import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
  })
  export class TranslationService {
    private apiUrl = 'https://api.mymemory.translated.net/get';
  
    constructor(private http: HttpClient) {}
  
    translateText(text: string, targetLang: string) {
      const body = {
        q: text,
        source: 'auto',  // Detects the source language
        target: targetLang,
        format: 'text'
      };
  
      return this.http.post<any>(this.apiUrl, body);
    }
  
    translateProjectDescriptions(projects: any[], targetLang: string) {
      // Mock translations for demo
      const mockTranslations: {
        [key: string]: {
          [key: string]: string
        }
      } = {
        'fr': {
          'A groundbreaking project': 'Un projet novateur',
          'Innovative solutions': 'Solutions innovantes',
          'Technology': 'Technologie',
          'Health': 'Santé'
          // Add more mock translations as needed
        },
        'rw': {
          'A groundbreaking project': 'Umushinga ukomeye',
          'Innovative solutions': 'Ibisubizo bishya',
          'Technology': 'Ikoranabuhanga',
          'Health': 'Ubuzima'
          // Add more mock translations as needed
        }
      };
      
      return of(projects.map(project => {
        if (!project.description) return '';
        
        // Look for exact matches or partial matches in the mock data
        const mockData = mockTranslations[targetLang] || {};
        for (const [english, translation] of Object.entries(mockData)) {
          if (project.description.includes(english)) {
            return project.description.replace(english, translation);
          }
        }
        
        return project.description;
      }));
    }
  }