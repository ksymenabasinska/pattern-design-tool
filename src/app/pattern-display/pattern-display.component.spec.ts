import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatternDisplayComponent } from './pattern-display.component';

describe('PatternDisplayComponent', () => {
  let component: PatternDisplayComponent;
  let fixture: ComponentFixture<PatternDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatternDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatternDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
