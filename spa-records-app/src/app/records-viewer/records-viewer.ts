import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  RegistryRecord,
  RecordType,
  RecordStatus,
  RecordTypeLabels,
  RecordStatusLabels
} from '../TypeDefs';
import { RecordsHandlerService } from '../services/records-handler.service';

@Component({
  selector: 'app-records-viewer',
  imports: [CommonModule, FormsModule],
  templateUrl: './records-viewer.html',
  styleUrl: './records-viewer.scss'
})
export class RecordsViewer implements OnInit {
  // Pagination State
  page: number = 1;
  pageSize: number = 25;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  totalRecords: number = 0;
  hasMore: boolean = true;

  // Records Data
  records: RegistryRecord[] = [];

  // Filter State
  selectedRecordType: RecordType | null = null;
  selectedRecordStatus: RecordStatus | null = null;
  searchQuery: string = '';

  // UI State
  loading: boolean = false;
  displayDensity: 'comfortable' | 'compact' = 'comfortable';
  errorMessage: string | null = null;
  emptyStateMessage: string = 'No records found. Try adjusting your filters.';

  // Options for dropdowns
  recordTypeOptions: RecordType[] = [];
  recordStatusOptions: RecordStatus[] = [];
  recordTypeLabels = RecordTypeLabels;
  recordStatusLabels = RecordStatusLabels;

  get filteredRecords(): RegistryRecord[] {
    let filtered = this.records;

    // Apply status filter if selected
    if (this.selectedRecordStatus) {
      filtered = filtered.filter(r => r.status === this.selectedRecordStatus);
    }

    // Apply search filter if query exists
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  constructor(
    private recordsHandlerService: RecordsHandlerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  initializeComponent(): void {
    this.loadRecordTypes();
    this.loadRecordStatuses();
    this.loadTotalRecords();
    this.loadRecords();
  }

  loadRecords(): void {
    this.loading = true;
    this.errorMessage = null;

    const offset = (this.page - 1) * this.pageSize;

    // Call service based on active type filter
    let request;
    if (this.selectedRecordType) {
      request = this.recordsHandlerService.getRecordsByType(
        this.selectedRecordType,
        this.pageSize,
        offset
      );
    } else {
      request = this.recordsHandlerService.getRecords(this.pageSize, offset);
    }

    request.subscribe({
      next: (data: RegistryRecord[]) => {
        this.records = data;
        this.hasMore = data.length === this.pageSize;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading records:', error);
        this.errorMessage = 'Failed to load records. Please try again later.';
        this.records = [];
        this.loading = false;
      }
    });
  }

  loadTotalRecords(): void {
    this.recordsHandlerService.getRecordsCount().subscribe({
      next: (count: number) => {
        this.totalRecords = count;
      },
      error: (error) => {
        console.error('Error loading record count:', error);
        this.totalRecords = 0;
      }
    });
  }

  loadRecordTypes(): void {
    this.recordTypeOptions = this.recordsHandlerService.getRecordTypes();
  }

  loadRecordStatuses(): void {
    this.recordStatusOptions = Object.values(RecordStatus);
  }

  onRecordTypeChange(value: string): void {
    this.selectedRecordType = value === 'null' || value === '' ? null : value as RecordType;
    this.page = 1;
    this.loadRecords();
  }

  onRecordStatusChange(value: string): void {
    this.selectedRecordStatus = value === 'null' || value === '' ? null : value as RecordStatus;
    this.page = 1;
  }

  onSearchQueryChange(query: string): void {
    this.searchQuery = query;
    this.page = 1;
  }

  nextPage(): void {
    if (this.hasMore) {
      this.page++;
      this.loadRecords();
      this.scrollToTop();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadRecords();
      this.scrollToTop();
    }
  }

  setPageSize(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.pageSize = parseInt(target.value);
    this.page = 1;
    this.loadRecords();
  }

  clearAllFilters(): void {
    this.selectedRecordType = null;
    this.selectedRecordStatus = null;
    this.searchQuery = '';
    this.page = 1;
    this.loadRecords();
  }

  viewRecordDetails(recordId: number): void {
    // Navigate to detail view (route not implemented yet)
    // this.router.navigate(['/records', recordId]);
    console.log('Navigate to record details for ID:', recordId);
  }

  getRecordTypeLabel(type: RecordType): string {
    return RecordTypeLabels[type];
  }

  getRecordStatusLabel(status: RecordStatus): string {
    return RecordStatusLabels[status];
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
