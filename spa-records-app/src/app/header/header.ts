import { Component } from '@angular/core';
import { NavMenu } from '../nav-menu/nav-menu';

@Component( {
  selector: 'app-header',
  templateUrl: './header.html',
  imports: [
    NavMenu
  ],
  styleUrl: './header.scss'
})
export class Header {

}
