import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CsvService } from './services/csv.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, retry } from 'rxjs';
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;



// pdfjsLib.GlobalWorkerOptions.workerSrc = './node_modules/pdfjs-dist/build/pdf.worker.min.js';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ReactiveFormsModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'leitor-de-csv';


  csvData$ = new BehaviorSubject<any>(undefined)
  ofxData$ = new BehaviorSubject<any>(undefined)
  pdfData$ = new BehaviorSubject<any>(undefined)


  constructor(
    private csvService: CsvService
  ) {
  }


  ngOnInit(): void {

  }

  async onArquivoSelecionado(event: any) {
    const arquivo = event.target.files[0] as File;
    if (!arquivo) {return;}

    if(arquivo.name.includes('csv')){
      this.csvService.processarArquivoCSV(arquivo)
      .subscribe(res => {
        const data = res?.data;
        console.log(data);
        this.csvData$.next(data);
      })

    }else if(arquivo.name.includes('ofx')){
      const text = await arquivo.text()
      this.csvService.processarArquivoOFX(text)
      .subscribe(res => {
        
        
        const data = res?.data;
        console.log(res);
        this.ofxData$.next(data);
      })
    }else {
      const reader = new FileReader();

      reader.onload = (readerEvent) => {
        const pdfFile = readerEvent.target?.result as ArrayBuffer;

        this.extractTextFromPDF(pdfFile)
          .then((text: any) => {
            console.log('Texto extraído do PDF:', text);
            this.pdfData$.next(text)
            return ''
          })
          .catch(error => {
            console.error('Erro ao extrair texto do PDF:', error);
          });
      };

      reader.readAsArrayBuffer(arquivo);
      
    }



  }

  convertToBase64(arquivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsLib.PDFWorker.workerSrc;
      const leitor = new FileReader();

      leitor.onload = (evento) => {
        console.log('evento', evento);
        
        const arrayBuffer = evento.target?.result as ArrayBuffer;

        pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise
          .then(pdf => pdf.getPage(1))
          .then(page => page.getTextContent())
          .then(textContent => {
            const textoDoPDF = textContent.items.map((item: any) => item?.str).join(' ');
            const stringConvertida = encodeURIComponent(textoDoPDF);
            const base64 = btoa(stringConvertida);

            resolve(base64);
          })
          .catch(error => reject(error));
      };

      leitor.readAsArrayBuffer(arquivo);
    });
  }

  extractTextFromPDF(pdfFile: ArrayBuffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const loadingTask = pdfjsLib.getDocument(new Uint8Array(pdfFile));

      loadingTask.promise.then((pdfDocument) => {
        const numPages = pdfDocument.numPages;
        const promises = [];

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          promises.push(pdfDocument.getPage(pageNum));
        }

        Promise.all(promises)
          .then(pages => {
            const pageTextPromises = pages.map(async (page) => {
              console.log(page.view);
              const content = await page.getTextContent();
              const itens = content?.items;
              console.log('itens', itens);
              
              let mapItens = itens.map((e: any) => ({str: e?.str}))
              resolve(mapItens)
              return mapItens
            }  );
            return Promise.all(pageTextPromises);
          })
          .then(texts => {
            resolve(texts);
          })
          .catch(error => {
            reject(error);
          });
      });
    });
  }

}
