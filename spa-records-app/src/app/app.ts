import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './footer/footer';
import { Header } from './header/header';
import { ToggleThemeButton } from './toggle-theme-button/toggle-theme-button';

@Component({
  selector: 'app-root',
  imports: [ RouterOutlet, Footer, Header, ToggleThemeButton ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('SPA Office of the Harbour Registry');
}
