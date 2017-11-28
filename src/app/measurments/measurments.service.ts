import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class MeasurmentsService {

  private measurments = new Subject<any>();

  constructor() { }

  get measurments$() {
    return Observable.from(this.measurments);
  }

  public setMeasurments(m) {
    this.measurments.next(m);
  }
}
