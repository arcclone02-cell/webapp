import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { Product } from '../library.service';

@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
  ],
  templateUrl: './product-form-dialog.component.html',
  styleUrls: ['./product-form-dialog.component.css'],
})
export class ProductFormDialogComponent {
  form: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProductFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Product | null
  ) {
    this.isEditMode = !!data;

    this.form = this.fb.group({
      title: [data?.title || '', [Validators.required, Validators.minLength(3)]],
      description: [data?.description || '', [Validators.required, Validators.minLength(10)]],
      price: [data?.price || '', [Validators.required, Validators.min(0)]],
      image: [data?.image || '', [Validators.required]],
      category: [data?.category || 'other', Validators.required],
      status: [data?.status || 'active', Validators.required],
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onImageUrlChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const url = input.value;
    const preview = document.querySelector('.image-preview') as HTMLImageElement;
    if (preview && url) {
      preview.src = url;
    }
  }
}
