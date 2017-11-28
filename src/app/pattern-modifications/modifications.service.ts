import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class ModificationsService {

  private modifications = new Subject<any>();

  constructor() { }

  get modifications$() {
    return Observable.from(this.modifications);
  }

  public set(value) {
    // console.log(value);
    this.modifications.next(value);
  }
}
