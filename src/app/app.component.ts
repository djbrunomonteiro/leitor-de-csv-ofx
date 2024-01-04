import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CsvService } from './services/csv.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ReactiveFormsModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'leitor-de-csv';

  form = this.fb.group({
    csv: [''],
    ocr: ['']
  })

  csvData$ = new BehaviorSubject<any>(undefined)


  constructor(
    private fb: FormBuilder,
    private csvService: CsvService
  ) {
  }


  ngOnInit(): void {

  }

  onArquivoSelecionado(event: any) {
    const arquivo = event.target.files[0];
    console.log(arquivo);
    
    if (arquivo) {
      this.csvService.processarArquivoCSV(arquivo)
        .subscribe(res => {
          const data = res?.data;
          console.log(data);
          this.csvData$.next(data);
          console.log(this.csvData$.value);
        })
    }
  }

}
