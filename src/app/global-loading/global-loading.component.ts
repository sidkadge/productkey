import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-global-loading',
  templateUrl: './global-loading.component.html',
  styleUrls: ['./global-loading.component.css']
})
export class GlobalLoadingComponent {
  @Input() isLoading: boolean = false;
}
