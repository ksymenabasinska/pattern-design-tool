import {MatSlideToggleChange} from '@angular/material/slide-toggle/typings';
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

  public skirtLength = 0.5;
  public waistLevel = 0;
  public flaringLevel = 0;
  public showFullSkirt = false;

  constructor(
    private modificationsService: ModificationsService
  ) {
    this.update();
  }

  ngOnInit() {
  }

  public skirtLengthChanged(change: MatSliderChange) {
    // console.log(change);
    this.skirtLength = change.value;
    this.update();
  }

  public waistLevelChanged(change: MatSliderChange) {
    // console.log(change);
    this.waistLevel = change.value;
    this.update();
  }

  public flaringChanged(change: MatSliderChange) {
    // console.log(change);
    this.flaringLevel = change.value;
    this.update();
  }

  public showFullToggled(change: MatSlideToggleChange) {
    this.showFullSkirt = change.checked;
    this.update();
  }

  private update() {
    this.modificationsService.set({
      skirtLength: this.skirtLength,
      showFullSkirt: this.showFullSkirt,
      waistLevel: this.waistLevel,
      flaring: this.flaringLevel,
    });
  }
}
