import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Art } from './art';
import { MatCard } from "@angular/material/card";

@Component({
  selector: 'app-art',
  templateUrl: './art.component.html',
  styleUrls: ['./art.component.css'],
  imports: [MatCard],
})
export class ArtComponent implements OnInit {
  @Input() art: Art= { id: '', name: '', artist: '', url: '' };
  @Output() edit = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}
}
