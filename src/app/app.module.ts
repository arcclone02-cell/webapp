import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BackendProvider } from './_helpers/backend';

@NgModule({
  imports: [
    HttpClientModule,
  ],
  providers: [BackendProvider],
})
export class AppModule {}
