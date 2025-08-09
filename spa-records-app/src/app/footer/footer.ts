import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  baseLink = 'https://sarimportauthority.org';
  footerALinks = [
    { label: 'About the Authority', url: `${this.baseLink}/about` },
    { label: 'Regulations', url: `${this.baseLink}/regulations` },
    { label: 'Public Notices', url: `${this.baseLink}/notices` }
  ];

  footerBLinks = [
    { label: 'Contact Us', url: `${this.baseLink}/contact` },
    { label: 'Emergency Procedures', url: `${this.baseLink}/eprocs` },
    { label: 'Harbour Services', url: `${this.baseLink}/harbourservices` }
  ];
}
