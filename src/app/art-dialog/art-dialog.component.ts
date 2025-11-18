import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Art } from '../art/art';
import { MatFormField } from '@angular/material/form-field';
import { MatLabel } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-art-dialog',
  templateUrl: './art-dialog.component.html',
  styleUrls: ['./art-dialog.component.css'],
  imports: [MatFormField, MatLabel, CommonModule, MatDialogModule, FormsModule, MatIconModule],
})
export class ArtDialogComponent {
  private backupArt: Partial<Art> ;
  constructor(
    public dialogRef: MatDialogRef<ArtDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ArtDialogData
    
  ) {
    this.backupArt = { ...data.art };
}

  cancel(): void {
    this.data.art.name = this.backupArt.name;
    this.data.art.artist = this.backupArt.artist;
    this.data.art.url = this.backupArt.url;
    this.dialogRef.close(this.data);
  }
}

export interface ArtDialogData {
  art: Art;
  enableDelete: boolean;
}

export interface ArtDialogResult {
  art: Art;
  delete?: boolean;
}
