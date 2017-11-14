import { Component, OnInit } from '@angular/core';
import { ModificationsService } from '../modifications.service';
import { Subscription } from 'rxjs/Rx';
import {MatSliderChange} from '@angular/material';

@Component({
  selector: 'pd-modifications-form',
  templateUrl: './modifications-form.component.html',
  styleUrls: ['./modifications-form.component.css']
})
export class ModificationsFormComponent implements OnInit {

  private skirtLength = 0.5;

  constructor(
    private modificationsService: ModificationsService
  ) {
    this.modificationsService.setSkirtLength(this.skirtLength);
  }

  ngOnInit() {
  }

  public skirtLengthChanged(change: MatSliderChange) {
    console.log(change);
    this.modificationsService.setSkirtLength(change.value);
  }
}
