import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject } from 'rxjs';
import * as XLSX from "xlsx";
import { TaskElement } from './models/app-models';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class AppComponent {

  title = 'Task-manager';


  isEditableNew: boolean = true;
  displayedColumns: string[] = ['summary','link','status','dueDate','editable'];
  colHeaders: string[] = [];
  TABLE1_DATA: TaskElement[] = [];
  dataSource = new MatTableDataSource<any>();
  changedData: BehaviorSubject<any[]> =  new BehaviorSubject<any[]>([]);;
  fileName!: string;
  workbook!: XLSX.WorkBook;
  constructor(private cd:ChangeDetectorRef ){}
  
  onFileChange(evt: any): void {
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length > 1) {
      alert('Multiple files are not allowed');
      return;
    }
    else {
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        this.fileName = target.files[0].name;
        this.workbook= wb;
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];
        let data:any[] = (XLSX.utils.sheet_to_json(ws, { header: 1 }));
       // XLSX.utils.json_to_sheet
        for (let i=1; i<data.length ; i++){
          let elem = new TaskElement();
          elem.summary = data[i][0];
          elem.link = data[i][1];
          elem.status = data[i][2];
          elem.dueDate = data[i][3];
          this.TABLE1_DATA.push(elem);
        }
        this.dataSource = new MatTableDataSource<any>(this.TABLE1_DATA);
        // Print the Excel Data
        console.log(this.TABLE1_DATA);
        // this.changedData.next(this.TABLE1_DATA);
      }
      reader.readAsBinaryString(target.files[0]);
    }
  }

  saveDataBackToExcel(event: any) {
    console.log(event);
    this.dataSource.data = event;
    // this.changedData.next(event);
    var newWB=XLSX.utils.book_new();
    var newWS=XLSX.utils.json_to_sheet(event);
    XLSX.utils.book_append_sheet(newWB, newWS,"Tasks");  
    XLSX.writeFile(newWB,'tasks.xlsx');
    }
    
}
