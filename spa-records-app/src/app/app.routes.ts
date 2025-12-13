import { Routes } from '@angular/router';
import { Intro } from './intro/intro';
import { RecordsViewer } from './records-viewer/records-viewer';

export const routes: Routes = [
  { path: '', component: Intro },
  { path: 'records', component: RecordsViewer }
];
