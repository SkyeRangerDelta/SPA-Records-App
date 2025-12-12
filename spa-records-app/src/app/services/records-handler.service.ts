import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { Department, RegistryRecord, RecordRes, RecordType, RecordTypeLabels } from '../TypeDefs';

@Injectable({
  providedIn: 'root'
})
export class RecordsHandlerService {

  private apiEndpoint = '/api/v1/';
  private recordsEndpoint = this.apiEndpoint + 'GetRecords';
  private recordsCountEndpoint = this.apiEndpoint + 'GetRecordsCount';

  constructor(private http: HttpClient) { }

  getRecords(limit?: number, offset?: number) {
    const params = [];
    if (limit !== undefined) params.push(`limit=${limit}`);
    if (offset !== undefined) params.push(`offset=${offset}`);
    const query = params.length ? `?${params.join('&')}` : '';
    return this.http.get(
      `${this.recordsEndpoint}${query}`,
    ).pipe(
      map((data: any) => {
        if (data && Array.isArray(data.records)) {
          return data.records;
        }

        if (Array.isArray(data)) {
          return data;
        }
        return [];
      }),
      catchError((e: unknown) => {
        console.error('Error fetching records:', e);
        return of([] as RegistryRecord[]);
      })
    );
  }

  getRecordById(id: number): Observable<RecordRes> {
    return this.http.get(`${this.recordsEndpoint}?id=${id}`).pipe(
      map((data: any) => {
        return {
          status: data.status,
          message: data.message,
          success: data.success,
          record: data.record || null
        } as RecordRes;
      }),
      catchError((e: any) => {
        console.error('Error fetching record by id:', e);

        if (e.status === 500) {
          return of({
            status: 500,
            message: 'Error fetching record',
            success: false,
            record: null
          } as RecordRes
          );
        }

        return of(
          {
            status: e.status || 500,
            message: e.message || 'Unknown error occurred',
            success: false,
            record: null
          } as RecordRes
        );
      })
    );
  }

  getRecordsByDepartment(departmentId: number, limit?: number, offset?: number) {
    const params = [`department=${departmentId}`];
    if (limit !== undefined) params.push(`limit=${limit}`);
    if (offset !== undefined) params.push(`offset=${offset}`);
    const query = params.length ? `?${params.join('&')}` : '';

    return this.http.get(`${this.recordsEndpoint}${query}`).pipe(
      map((data: any) => {
        if (data && Array.isArray(data.records)) {
          return data.records;
        }
        return [];
      }),
      catchError((e: unknown) => {
        console.error('Error fetching records by department:', e);
        return of([] as RegistryRecord[]);
      })
    );
  }

  getRecordsCount(): Observable<number> {
    return this.http.get(`${this.recordsCountEndpoint}`).pipe(
      map((data: any) => {
        return data.count || 0;
      }),
      catchError((e: any) => {
        console.error('Error fetching records count:', e);
        return of(0);
      })
    );
  }

  getRecordsByType(recordType: RecordType, limit?: number, offset?: number) {
    const params = [`recordType=${recordType}`];
    if (limit !== undefined) params.push(`limit=${limit}`);
    if (offset !== undefined) params.push(`offset=${offset}`);
    const query = params.length ? `?${params.join('&')}` : '';

    return this.http.get(`${this.recordsEndpoint}${query}`).pipe(
      map((data: any) => {
        if (data && Array.isArray(data.records)) {
          return data.records;
        }
        return [];
      }),
      catchError((e: unknown) => {
        console.error('Error fetching records by type:', e);
        return of([] as RegistryRecord[]);
      })
    );
  }

  getDepartments() {
    return this.http.get(`${this.apiEndpoint}GetDepartments`).pipe(
      map((data: any) => {
        return data.departments;
      }),
      catchError((e: any) => {
        console.error('Error fetching departments:', e);
        return of([] as Department[]);
      })
    );
  }

  getRecordTypes() {
    return Object.values(RecordType);
  }

  getRecordTypeLabel(type: RecordType): string {
    return RecordTypeLabels[type];
  }
}
