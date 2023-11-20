import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WrappableTableComponent } from './wrappable-table.component';

describe('WrappableTableComponent', () => {
  let component: WrappableTableComponent;
  let fixture: ComponentFixture<WrappableTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WrappableTableComponent]
    });
    fixture = TestBed.createComponent(WrappableTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
