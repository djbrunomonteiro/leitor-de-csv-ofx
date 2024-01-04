import { Injectable } from '@angular/core';
import Papa from 'papaparse';
import { Ofx } from 'ofx-data-extractor'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CsvService {

  constructor(
  ) { }

  processarArquivoCSV(arquivo: File) {
    return new Observable<any>(observer =>{
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

  processarArquivoOFX(arquivo: File){
    return new Observable<any>(observer =>{
      Ofx.fromBlob(arquivo).then(r =>{
        observer.next(r.toJson())
      })
    })
  }
}
