
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LearnComponent } from './components/learn/learn.component';
import { QuizComponent } from './components/quiz/quiz.component';
import { AboutComponent } from './components/about/about.component';

export const APP_ROUTES: Routes = [
  { path: '', component: HomeComponent, title: 'Conect Fácil - Início' },
  { path: 'learn', component: LearnComponent, title: 'Conect Fácil - Aprenda' },
  { path: 'quiz', component: QuizComponent, title: 'Conect Fácil - Quiz' },
  { path: 'about', component: AboutComponent, title: 'Conect Fácil - Sobre' },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
