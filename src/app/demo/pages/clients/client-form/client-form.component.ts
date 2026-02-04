import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { ClientService } from '../../../../core/services/client.service';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-client-form',
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
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss']
})
export default class ClientFormComponent {
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private router = inject(Router);

  clientForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  loading = false;
  error = '';
  success = '';

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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  onSubmit(): void {
    if (this.clientForm.invalid || !this.selectedFile) {
      this.error = 'Complete todos los campos y seleccione una foto';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const formValue = this.clientForm.value;
    const clientData = {
      ...formValue,
      birthday: this.formatDate(new Date(formValue.birthday)),
      photo: this.selectedFile
    };

    this.clientService.createClient(clientData).subscribe({
      next: () => {
        this.success = 'Cliente creado exitosamente';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/clients']);
        }, 1500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al crear el cliente';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
