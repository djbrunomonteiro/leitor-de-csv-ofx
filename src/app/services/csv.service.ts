import { Injectable } from '@angular/core';
import Papa from 'papaparse';
import { Ofx } from 'ofx-data-extractor'
import { Observable } from 'rxjs';
import * as Tesseract from 'tesseract.js';
@Injectable({
  providedIn: 'root'
})
export class CsvService {

  constructor(
  ) { }

  processarArquivoCSV(arquivo: File) {
    return new Observable<any>(observer => {
      Papa.parse(arquivo, {
        complete: (resultado) => {
          // O resultado contém os dados CSV processados
          console.log(resultado);
          observer.next(resultado)
        },
        header: true, // Defina como true se a primeira linha do CSV contiver cabeçalhos
      });

    })
  }

  processarArquivoOFX(arquivo: string) {
    return new Observable<any>(observer => {
      const ofx = new Ofx(arquivo);
      const headers = ofx.getHeaders()
      const bankTransferList = ofx.getBankTransferList()
      observer.next({headers, data: bankTransferList})
    })
  }

  processarArquivoPDF(imagemBase64: string){
    return new Observable<any>(observer => {
      Tesseract.recognize(
        imagemBase64,
        undefined,
        {
          logger: info => console.log(info) // opcional: exibe informações de log
        }
      ).then(({ data: { text } }) => {
        observer.next({data: text});
      }).catch(error => {
        console.error(error);
        
        observer.next({data: undefined, error: true});
      });
    });
  }
}
