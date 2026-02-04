import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { ClientService, ClientResponse } from '../../../../core/services/client.service';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export default class ClientListComponent implements OnInit, OnDestroy {
  private clientService = inject(ClientService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  clients: ClientResponse[] = [];
  filteredClients: ClientResponse[] = [];
  loading = true;
  error = '';
  searchTerm = '';

  // Polling automático
  private pollingSubscription: Subscription | null = null;
  private readonly POLLING_INTERVAL = 10000; // 10 segundos

  // Panel lateral
  showPanel = false;
  panelMode: 'create' | 'view' = 'create';
  selectedClient: ClientResponse | null = null;

  // Formulario
  clientForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  formLoading = false;
  formError = '';
  formSuccess = '';

  documentTypes = ['DNI', 'RUC'];
  genders = ['Masculino', 'Femenino', 'Otro'];

  constructor() {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      document_type: ['DNI', [Validators.required]],
      document: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      address: ['', [Validators.required]],
      cellphome: ['', [Validators.required, Validators.pattern(/^9\d{8}$/)]],
      email: ['', [Validators.required, Validators.email]],
      gender: ['', [Validators.required]],
      birthday: ['', [Validators.required]]
    });

    this.clientForm.get('document_type')?.valueChanges.subscribe(type => {
      const documentControl = this.clientForm.get('document');
      if (type === 'DNI') {
        documentControl?.setValidators([Validators.required, Validators.pattern(/^\d{8}$/)]);
      } else {
        documentControl?.setValidators([Validators.required, Validators.pattern(/^\d{11}$/)]);
      }
      documentControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.loadClients();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  /**
   * Inicia el polling automático para sincronización en tiempo real
   */
  private startPolling(): void {
    this.pollingSubscription = interval(this.POLLING_INTERVAL).subscribe(() => {
      this.refreshClientsSilently();
    });
  }

  /**
   * Detiene el polling automático
   */
  private stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }

  /**
   * Refresca la lista de clientes de forma silenciosa (sin mostrar loading)
   */
  private refreshClientsSilently(): void {
    this.clientService.getClients().subscribe({
      next: (data) => {
        // Solo actualizar si hay cambios
        if (JSON.stringify(this.clients) !== JSON.stringify(data)) {
          this.clients = data;
          // Aplicar el filtro de búsqueda actual
          if (this.searchTerm) {
            this.filteredClients = this.clients.filter(client =>
              client.name.toLowerCase().includes(this.searchTerm) ||
              client.last_name.toLowerCase().includes(this.searchTerm) ||
              client.email.toLowerCase().includes(this.searchTerm) ||
              client.document.includes(this.searchTerm)
            );
          } else {
            this.filteredClients = data;
          }
          this.cdr.detectChanges();
        }
      },
      error: () => {
        // En caso de error durante polling silencioso, no hacer nada
      }
    });
  }

  loadClients(): void {
    this.loading = true;
    this.error = '';
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.filteredClients = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error al cargar los clientes';
        this.loading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value.toLowerCase();
    this.filteredClients = this.clients.filter(client =>
      client.name.toLowerCase().includes(this.searchTerm) ||
      client.last_name.toLowerCase().includes(this.searchTerm) ||
      client.email.toLowerCase().includes(this.searchTerm) ||
      client.document.includes(this.searchTerm)
    );
  }

  openCreatePanel(): void {
    this.panelMode = 'create';
    this.selectedClient = null;
    this.resetForm();
    this.showPanel = true;
  }

  openViewPanel(client: ClientResponse): void {
    this.panelMode = 'view';
    this.selectedClient = client;
    this.showPanel = true;
  }

  closePanel(): void {
    this.showPanel = false;
    this.resetForm();
  }

  resetForm(): void {
    this.clientForm.reset({
      document_type: 'DNI'
    });
    this.selectedFile = null;
    this.previewUrl = null;
    this.formError = '';
    this.formSuccess = '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.formError = 'Complete todos los campos correctamente';
      this.clientForm.markAllAsTouched();
      return;
    }

    if (this.panelMode === 'create' && !this.selectedFile) {
      this.formError = 'Seleccione una foto';
      return;
    }

    this.formLoading = true;
    this.formError = '';
    this.formSuccess = '';

    const formValue = this.clientForm.value;
    const clientData = {
      ...formValue,
      birthday: this.formatDate(new Date(formValue.birthday)),
      photo: this.selectedFile!
    };

    this.clientService.createClient(clientData).subscribe({
      next: () => {
        this.formSuccess = 'Cliente creado exitosamente';
        this.formLoading = false;
        this.loadClients();
        setTimeout(() => {
          this.closePanel();
        }, 1500);
      },
      error: (err) => {
        this.formError = err.error?.message || 'Error al crear el cliente';
        this.formLoading = false;
        console.error(err);
      }
    });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  getPanelTitle(): string {
    switch (this.panelMode) {
      case 'create': return 'Nuevo Cliente';
      case 'view': return 'Detalle del Cliente';
    }
  }

  calculateAge(birthday: string): number {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}
