import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { InstructorService, InstructorResponse } from '../../../../core/services/instructor.service';
import { MatSelectModule } from '@angular/material/select';
import { Subscription, interval } from 'rxjs';
import Swal from 'sweetalert2';

const swal = Swal.mixin({
  customClass: {
    popup: 'swal-popup-custom',
    title: 'swal-title-custom',
    htmlContainer: 'swal-text-custom',
    confirmButton: 'swal-btn-confirm',
    cancelButton: 'swal-btn-cancel',
    icon: 'swal-icon-custom'
  },
  buttonsStyling: false,
  position: 'top-end',
  showCloseButton: true,
  width: '380px'
});

@Component({
  selector: 'app-instructor-list',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    ReactiveFormsModule,
    MatSelectModule
  ],
  templateUrl: './instructor-list.component.html',
  styleUrls: ['./instructor-list.component.scss']
})
export default class InstructorListComponent implements OnInit, OnDestroy {
  private instructorService = inject(InstructorService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  instructors: InstructorResponse[] = [];
  filteredInstructors: InstructorResponse[] = [];
  loading = true;
  error = '';
  searchTerm = '';

  // Polling automático
  private pollingSubscription: Subscription | null = null;
  private readonly POLLING_INTERVAL = 10000; // 10 segundos

  // Panel lateral
  showPanel = false;
  panelMode: 'create' | 'view' | 'edit' = 'create';
  selectedInstructor: InstructorResponse | null = null;

  @ViewChild('pageTop') pageTop!: ElementRef;

  // Formulario
  instructorForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  formLoading = false;
  formError = '';
  formSuccess = '';

  statusOptions = [
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' }
  ];

  beltLevels = ['Blanca', 'Amarilla', 'Naranja', 'Verde', 'Azul', 'Marrón', 'Negra'];

  constructor() {
    this.instructorForm = this.fb.group({
      name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      specialty: ['', [Validators.required]],
      belt_level: ['', [Validators.required]],
      bio: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^9\d{8}$/)]],
      experience_years: [0, [Validators.required, Validators.min(0)]],
      certifications: [''],
      social_media_facebook: [''],
      social_media_instagram: [''],
      social_media_twitter: [''],
      status: ['active', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadInstructors();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  private startPolling(): void {
    this.pollingSubscription = interval(this.POLLING_INTERVAL).subscribe(() => {
      this.refreshInstructorsSilently();
    });
  }

  private stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }

  private refreshInstructorsSilently(): void {
    this.instructorService.getInstructors().subscribe({
      next: (data) => {
        if (JSON.stringify(this.instructors) !== JSON.stringify(data)) {
          this.instructors = data;
          this.applySearch();
          this.cdr.detectChanges();
        }
      },
      error: () => {
        // En caso de error durante polling silencioso, no hacer nada
      }
    });
  }

  loadInstructors(): void {
    this.loading = true;
    this.error = '';
    this.instructorService.getInstructors().subscribe({
      next: (data) => {
        this.instructors = data;
        this.applySearch();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error al cargar los instructores';
        this.loading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value.toLowerCase();
    this.applySearch();
  }

  // Única fuente de filtrado — se reutiliza en polling, carga inicial y búsqueda
  private applySearch(): void {
    if (!this.searchTerm) {
      this.filteredInstructors = [...this.instructors];
      return;
    }
    this.filteredInstructors = this.instructors.filter(instructor =>
      instructor.name.toLowerCase().includes(this.searchTerm) ||
      instructor.last_name.toLowerCase().includes(this.searchTerm) ||
      instructor.email.toLowerCase().includes(this.searchTerm) ||
      instructor.specialty.toLowerCase().includes(this.searchTerm)
    );
  }

  openCreatePanel(): void {
    this.panelMode = 'create';
    this.selectedInstructor = null;
    this.resetForm();
    this.showPanel = true;
  }

  openViewPanel(instructor: InstructorResponse): void {
    this.panelMode = 'view';
    this.selectedInstructor = instructor;
    this.showPanel = true;
  }

  openEditPanel(instructor: InstructorResponse): void {
    this.panelMode = 'edit';
    this.selectedInstructor = instructor;
    this.instructorForm.patchValue({
      name: instructor.name,
      last_name: instructor.last_name,
      specialty: instructor.specialty,
      belt_level: instructor.belt_level,
      bio: instructor.bio || '',
      email: instructor.email,
      phone: instructor.phone,
      experience_years: instructor.experience_years,
      certifications: instructor.certifications || '',
      social_media_facebook: instructor.social_media_facebook || '',
      social_media_instagram: instructor.social_media_instagram || '',
      social_media_twitter: instructor.social_media_twitter || '',
      status: instructor.status
    });
    this.previewUrl = instructor.photo ? `http://localhost:8080/uploads/${instructor.photo}` : null;
    this.selectedFile = null;
    this.formError = '';
    this.formSuccess = '';
    this.showPanel = true;
  }

  closePanel(): void {
    this.showPanel = false;
    this.resetForm();
  }

  resetForm(): void {
    this.instructorForm.reset({
      status: 'active'
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

  onSubmit(): void {
    if (this.instructorForm.invalid) {
      this.formError = 'Complete todos los campos correctamente';
      this.instructorForm.markAllAsTouched();
      return;
    }

    if (this.panelMode === 'create' && !this.selectedFile) {
      this.formError = 'Seleccione una foto';
      return;
    }

    this.formLoading = true;
    this.formError = '';
    this.formSuccess = '';

    const formValue = this.instructorForm.value;
    const instructorData = {
      ...formValue,
      photo: this.selectedFile!
    };

    if (this.panelMode === 'edit' && this.selectedInstructor) {
      this.instructorService.updateInstructor(this.selectedInstructor.id, instructorData).subscribe({
        next: () => {
          this.formLoading = false;
          this.loadInstructors();
          this.closePanel();
          this.scrollToTop();
          swal.fire({
            title: 'Instructor actualizado',
            text: `${this.selectedInstructor!.name} ${this.selectedInstructor!.last_name} fue actualizado exitosamente.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: (err) => {
          this.formError = err.error?.message || 'Error al actualizar el instructor';
          this.formLoading = false;
          console.error(err);
        }
      });
    } else {
      this.instructorService.createInstructor(instructorData).subscribe({
        next: () => {
          this.formLoading = false;
          this.loadInstructors();
          this.closePanel();
          this.scrollToTop();
          swal.fire({
            title: 'Instructor creado',
            text: 'El nuevo instructor fue agregado exitosamente.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: (err) => {
          this.formError = err.error?.message || 'Error al crear el instructor';
          this.formLoading = false;
          console.error(err);
        }
      });
    }
  }

  private scrollToTop(): void {
    this.pageTop?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  getPanelTitle(): string {
    switch (this.panelMode) {
      case 'create': return 'Nuevo Instructor';
      case 'edit': return 'Editar Instructor';
      case 'view': return 'Detalle del Instructor';
    }
  }

  getStatusLabel(status: string): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace('_', '-');
  }

  async togglePublish(instructor: InstructorResponse, event: Event): Promise<void> {
    event.stopPropagation();

    const action = instructor.is_published ? 'despublicar' : 'publicar';

    const { isConfirmed } = await swal.fire({
      title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} instructor?`,
      text: `¿Está seguro de ${action} a ${instructor.name} ${instructor.last_name} de la web?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: instructor.is_published ? '#dc2626' : '#16a34a'
    });

    if (!isConfirmed) return;

    const request = instructor.is_published
      ? this.instructorService.unpublishInstructor(instructor.id)
      : this.instructorService.publishInstructor(instructor.id);

    request.subscribe({
      next: () => {
        instructor.is_published = !instructor.is_published;
        this.cdr.detectChanges();
        swal.fire({
          title: action === 'publicar' ? 'Publicado' : 'Despublicado',
          text: `${instructor.name} ${instructor.last_name} fue ${action === 'publicar' ? 'publicado' : 'despublicado'} exitosamente.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        swal.fire({
          title: 'Error',
          text: `Error al ${action} el instructor: ${err.error?.message || 'Error desconocido'}`,
          icon: 'error'
        });
        console.error(err);
      }
    });
  }

  async toggleStatus(instructor: InstructorResponse, event: Event): Promise<void> {
    event.stopPropagation();

    const isActive = instructor.status === 'active';
    const action = isActive ? 'desactivar' : 'activar';

    const { isConfirmed } = await swal.fire({
      title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} instructor?`,
      text: `${instructor.name} ${instructor.last_name} será ${action === 'activar' ? 'activado' : 'desactivado'}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: 'Cancelar'
    });

    if (!isConfirmed) return;

    const request = isActive
      ? this.instructorService.deactivateInstructor(instructor.id)
      : this.instructorService.activateInstructor(instructor.id, instructor);

    request.subscribe({
      next: () => {
        instructor.status = isActive ? 'inactive' : 'active';
        this.cdr.detectChanges();
        swal.fire({
          title: isActive ? 'Instructor desactivado' : 'Instructor activado',
          text: `${instructor.name} ${instructor.last_name} fue ${action}do exitosamente.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        swal.fire({
          title: 'Error',
          text: `Error al ${action} el instructor: ${err.error?.message || 'Error desconocido'}`,
          icon: 'error'
        });
        console.error(err);
      }
    });
  }
}
