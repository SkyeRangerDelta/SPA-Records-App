import { Component } from '@angular/core';

@Component({
  selector: 'app-toggle-theme-button',
  imports: [],
  templateUrl: './toggle-theme-button.html',
  styleUrl: './toggle-theme-button.scss'
})
export class ToggleThemeButton {
  toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
  }
}
