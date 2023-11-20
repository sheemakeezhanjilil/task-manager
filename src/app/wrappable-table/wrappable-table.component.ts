import { LiveAnnouncer } from '@angular/cdk/a11y';
import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Observable, Subject, of, take, takeUntil } from 'rxjs';
import { TaskElement } from '../models/app-models';

@Component({
  selector: 'app-wrappable-table',
  templateUrl: './wrappable-table.component.html',
  styleUrls: ['./wrappable-table.component.scss'],
  
})
export class WrappableTableComponent implements  OnInit, OnDestroy {

  todayDate:Date = new Date();
  VOForm!: FormGroup;
  @ViewChild(MatTable, { static: true })
  table!: MatTable<TaskElement>;
  @ViewChild(MatSort)
  sort!: MatSort;
  isLoading = true;
  tableData!: Observable<TaskElement[]>;
  unsubscribe: Subject<boolean> = new Subject<boolean>();

  @Input()
  columns: string[] = [];

  _data!: TaskElement[];
  isEditableNew: boolean = false;
  @Input() set data(data: TaskElement[]) {
    if(data && data.length>=0) {
      this._data =data;
      this.tableData = of(data);
    }

  }
  

  @Input()
  dataSource!: MatTableDataSource<any>;

  @Output() onDataChangeEvent = new EventEmitter<any>();


  constructor(
    private fb: FormBuilder,
    private _formBuilder: FormBuilder,
    private _liveAnnouncer: LiveAnnouncer,
    private datePipe: DatePipe){}

  ngOnInit(){
    let unsub$ = this.unsubscribe.asObservable();

    this.tableData.pipe(takeUntil(unsub$)).subscribe(data => {
      this.VOForm = this._formBuilder.group({
        VORows: this._formBuilder.array([])
      });
      
      this.VOForm = this.fb.group({
        VORows: this.fb.array(data.map(val => this.fb.group({
          summary: new FormControl(val.summary),
          link: new FormControl(val.link),
          status: new FormControl(val.status),
          dueDate: new FormControl(val.dueDate),
          action: new FormControl('existingRecord'),
          isEditable: new FormControl(true),
          isNewRow: new FormControl(false),
        })
        )) //end of fb array
      }); // end of form group cretation
      this.isLoading = false;
      this.dataSource = new MatTableDataSource((this.VOForm.get('VORows') as FormArray).controls);
      console.log(this.VOForm.get('VORows'))
      console.log(this._data)
  
      const filterPredicate = this.dataSource.filterPredicate;
        this.dataSource.filterPredicate = (data: AbstractControl, filter) => {
          return filterPredicate.call(this.dataSource, data.value, filter);
        }
        this.VOForm.disable();
        const summary = this.VOForm.controls['summary'];
        if (summary)
        summary.valueChanges.subscribe(val => console.log(val))
    })
    
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.sort = this.sort;
    this.dataSource.sortData = (data: FormGroup[], sort: MatSort) => {
      //in "data" you has the array of FormGroup
      //in sort.direction you has "asc,"desc" or ""
      //in sort.active you has the column you clicked
      const factor =
        sort.direction == "asc" ? 1 : sort.direction == "desc" ? -1 : 0;
      if (factor) {
        data = data.sort((a: FormGroup, b: FormGroup) => {
          const aValue = a.get(sort.active) ? a.get(sort.active)?.value : null;
          const bValue = a.get(sort.active) ? b.get(sort.active)?.value : null;
          return aValue > bValue ? factor : aValue < bValue ? -factor : 0;
        });
      }
      return data;
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    this.VOForm = this.fb.group({
      VORows: this.fb.array(this._data.map(val => this.fb.group({
        summary: new FormControl(val.summary),
        link: new FormControl(val.link),
        status: new FormControl(val.status),
        dueDate: new FormControl(val.dueDate),
        action: new FormControl('existingRecord'),
        isEditable: new FormControl(true),
        isNewRow: new FormControl(false),
      })
      )) //end of fb array
    }); // end of form group cretation
  }

  ngOnDestroy() {
    this.unsubscribe.next(true);
    this.unsubscribe.complete();
}


  AddNewRow() {
    // this.getBasicDetails();
    const control = this.VOForm.get('VORows') as FormArray;
    control.insert(0,this.initiateVOForm());
    this.dataSource = new MatTableDataSource(control.controls)
    // control.controls.unshift(this.initiateVOForm());
    // this.openPanel(panel);
      // this.table.renderRows();
      // this.dataSource.data = this.dataSource.data;
  }
  initiateVOForm(): FormGroup {
    return this.fb.group({
                summary: new FormControl(''),
                link: new FormControl(''),
                status: new FormControl(''),
                dueDate: new FormControl(''),
                action: new FormControl('newRecord'),
                isEditable: new FormControl(false),
                isNewRow: new FormControl(true),
    });
  }

  applyFilter(event: Event) {
    //  debugger;
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  // this function will enabled the select field for editd
  EditSVO(VOFormElement:FormGroup, i:number) {
    console.log(VOFormElement);
    VOFormElement.controls['isEditable'].setValue(false);
    VOFormElement.enable({
      onlySelf: true,
      emitEvent: true
  });
    

  }

  // On click of correct button in table (after click on edit) this method will call
  SaveVO(VOFormElement:FormGroup, i:number) {
    // alert('SaveVO')
    VOFormElement.disable({
      onlySelf: true,
      emitEvent: true
  });
    VOFormElement.valueChanges.subscribe(change => {console.log(change);
      let newTaskElement:TaskElement = new TaskElement(change);
      
    this._data = this._data.filter(x => x.summary?.localeCompare(change.summary));
    this._data.push(newTaskElement);
    console.log(this._data);
    this.dataChangeEvent(this._data);
  });
    VOFormElement.controls['isEditable'].setValue(true);

  }

  // On click of cancel button in the table (after click on edit) this method will call and reset the previous data
  CancelSVO(VOFormElement:FormGroup, i:number) {
    VOFormElement.patchValue(this._data[i]);
    VOFormElement.disable({
      onlySelf: true,
      emitEvent: true
  });
  VOFormElement.controls['isEditable'].setValue(true);
  }

  DeleteSVO(VOFormElement:FormGroup, i:number) {
    let deletedItem = this._data.splice(i,1);
    this._data = this._data.filter(item => (item !== deletedItem[0]));
    console.log(this.VOForm)
    this.dataSource.data = this._data;
    this.dataChangeEvent(this._data);

    }

  isEditable(element:FormGroup,i: number): boolean {
    if(element.value['isEditable']) {
      return true
    }
    return false
  }

  onValueChanges(): void {
    this.VOForm.valueChanges.pipe(take(1)).subscribe((val) => {
      // console.log(val);
    });
  }

  dataChangeEvent(event: any) {
    console.log(event);
    this.onDataChangeEvent.emit(event);
  }

  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  getRowColor(row:any): string {
    console.log(row)
    let color: string = '';
    let currDate = this.datePipe.transform(this.todayDate,'yyyy-MM-dd');
    var dueDate = new Date(row.value.dueDate);
    var weekAgoDate = dueDate.setDate(dueDate.getDate()- 7);
    let warnDate = this.datePipe.transform(weekAgoDate,'yyyy-MM-dd');
    if (currDate && row.value.dueDate <= currDate) {
      color = 'red'
    } else if (currDate && warnDate && (currDate >= warnDate) && (warnDate < row.value.dueDate)) {
      color = 'yellow'
    } else {
      color = 'white'
    }
    return color;
  }

}


