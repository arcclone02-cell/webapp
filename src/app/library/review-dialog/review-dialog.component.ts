import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export interface ReviewData {
  purchaseId: string;
  productTitle: string;
}

@Component({
  selector: 'app-review-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './review-dialog.component.html',
  styleUrls: ['./review-dialog.component.css'],
})
export class ReviewDialogComponent {
  form: FormGroup;
  rating = 5;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReviewData
  ) {
    this.form = this.fb.group({
      comment: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  setRating(stars: number): void {
    this.rating = stars;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.valid) {
      const review = {
        rating: this.rating,
        comment: this.form.value.comment,
        reviewedAt: new Date(),
      };
      this.dialogRef.close(review);
    }
  }
}
