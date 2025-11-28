import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { HttpClient } from '@angular/common/http';
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
  imagePreview: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProductFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Product | null,
    private http: HttpClient
  ) {
    this.isEditMode = !!data;

    this.form = this.fb.group({
      title: [data?.title || '', [Validators.required, Validators.minLength(3)]],
      description: [data?.description || '', [Validators.required, Validators.minLength(10)]],
      price: [data?.price || '', [Validators.required, Validators.min(0)]],
      image: [data?.image || '', [Validators.required]],
      category: [data?.category || 'other', Validators.required],
      status: [data?.status || 'active', Validators.required],
      tags: [data?.tags?.join(', ') || '', []],
      isFree: [data?.isFree || false],
    });

    // Nếu chế độ chỉnh sửa, hiển thị ảnh cũ
    if (this.isEditMode && data?.image) {
      this.imagePreview = data.image;
    }
  }

  onCancel(): void {
    console.log('Dialog cancelled');
    this.dialogRef.close();
  }

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      const formValue = { ...this.form.value };
      
      // Convert tags string to array
      if (formValue.tags && typeof formValue.tags === 'string') {
        formValue.tags = formValue.tags
          .split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag.length > 0);
      }
      
      // Nếu có imagePreview (Base64), sử dụng nó
      if (this.imagePreview) {
        formValue.image = this.imagePreview;
      } else if (!this.selectedFile && !this.imagePreview && this.isEditMode) {
        // Chế độ edit và không thay đổi ảnh - sử dụng ảnh cũ
        formValue.image = this.data?.image || '';
      }
      
      console.log('Submitting product form with tags:', formValue);
      this.dialogRef.close(formValue);
    } else {
      console.log('Form invalid:', this.form.errors);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      // Kiểm tra loại file
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn một file ảnh');
        return;
      }

      // Kiểm tra kích thước file (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 50MB');
        return;
      }

      this.selectedFile = file;

      // Tạo preview và Base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        this.imagePreview = base64String;
        // Cập nhật giá trị form để validation pass
        this.form.patchValue({ image: file.name });
      };
      reader.readAsDataURL(file);
    }
  }
}
