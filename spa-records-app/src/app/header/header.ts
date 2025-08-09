import { Component } from '@angular/core';
import { NavMenu } from '../nav-menu/nav-menu';
import { RouterLink } from '@angular/router';

@Component( {
  selector: 'app-header',
  templateUrl: './header.html',
  imports: [
    NavMenu,
    RouterLink
  ],
  styleUrl: './header.scss'
})
export class Header {

}
