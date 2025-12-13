import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordsViewer } from './records-viewer';

describe('RecordsViewer', () => {
  let component: RecordsViewer;
  let fixture: ComponentFixture<RecordsViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordsViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecordsViewer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
