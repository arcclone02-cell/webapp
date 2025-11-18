import { CdkDragDrop, DragDropModule, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import {
  ArtDialogComponent,
  ArtDialogResult,
} from '../art-dialog/art-dialog.component';
import { Art } from '../art/art';
import { AuthService } from '../auth/auth.service';
import { MatCard } from "@angular/material/card";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { ArtComponent } from '../art/art.component';
@Component({
  selector: 'app-home',
  
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [MatCard, MatToolbarModule, MatIconModule, DragDropModule, AsyncPipe, ArtComponent, CommonModule],
})
export class HomeComponent implements OnInit {
  inStock!: Observable<Art[]>;
  inBidding!: Observable<Art[]>;
  sold!: Observable<Art[]>;

  constructor(
    private dialog: MatDialog,
    private store: AngularFirestore,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Khởi tạo các collection sau khi store đã được inject
    this.inStock = this.store
      .collection('inStock')
      .valueChanges({ idField: 'id' }) as Observable<Art[]>;

    this.inBidding = this.store
      .collection('inBidding')
      .valueChanges({ idField: 'id' }) as Observable<Art[]>;

    this.sold = this.store
      .collection('sold')
      .valueChanges({ idField: 'id' }) as Observable<Art[]>;
  }

  drop(event: CdkDragDrop<Art[]>): void {
    if (event.previousContainer === event.container) return;

    const item = event.previousContainer.data[event.previousIndex];
    this.store.firestore.runTransaction(() => {
      return Promise.all([
        this.store.collection(event.previousContainer.id).doc(item.id).delete(),
        this.store.collection(event.container.id).add(item),
      ]);
    });

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }

  edit(list: 'inStock' | 'inBidding' | 'sold', art: Art): void {
    const dialogRef = this.dialog.open(ArtDialogComponent, {
      width: '500px',
      data: { art, enableDelete: true },
    });

    dialogRef.afterClosed().subscribe((result: ArtDialogResult) => {
      if (!result) return; // tránh lỗi khi đóng dialog không trả dữ liệu

      if (result.delete) {
        this.store.collection(list).doc(art.id).delete();
      } else {
        this.store.collection(list).doc(art.id).update(result.art);
      }
    });
  }

  newArt(): void {
    const dialogRef = this.dialog.open(ArtDialogComponent, {
      width: '500px',
      data: { art: {} },
    });

    dialogRef.afterClosed().subscribe((result: ArtDialogResult) => {
      if (!result) return;

      const newArt = {
        name: result.art.name,
        artist: result.art.artist,
        url: result.art.url,
      };
      this.store.collection('inStock').add(newArt);
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}