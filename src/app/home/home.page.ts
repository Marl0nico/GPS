import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonButton,
  IonInput,
} from '@ionic/angular/standalone';

import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonInput,
  ],
})
export class HomePage implements OnInit {
  nombre: string = '';
  latitud: number | null = null;
  longitud: number | null = null;
  ubicacionActivada: boolean = false;

  constructor(private firestore: Firestore) {}
  async ngOnInit() {
    await Geolocation.requestPermissions();
    this.getCurrentLocation();
  }

  async getCurrentLocation() {
    try {
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      });

      this.latitud = coordinates.coords.latitude;
      this.longitud = coordinates.coords.longitude;
      console.log('Latitud:', this.latitud);
      console.log('Longitud:', this.longitud);
    } catch (error) {
      console.error('Error al obtener ubicación', error);
    }
  }

  async activarUbicacion() {
    this.ubicacionActivada = true;
    await this.getCurrentLocation();
  }

  desactivarUbicacion() {
    this.ubicacionActivada = false;
    this.latitud = null;
    this.longitud = null;
  }

  abrirGoogle_Maps() {
    if (this.latitud !== null && this.longitud !== null) {
      const url = `https://www.google.com/maps?q=${this.latitud},${this.longitud}`;
      window.open(url, '_blank');
    } else {
      alert('Ubicación no disponible');
    }
  }

  async enviarUbicacion_Firebase() {
    if (!this.nombre) {
      alert('Por favor ingresa tu nombre');
      return;
    }

    if (this.latitud === null || this.longitud === null) {
      alert('Primero debes obtener tu ubicación.');
      return;
    }

    const url = `https://www.google.com/maps?q=${this.latitud},${this.longitud}`;

    try {
      const ubicacionesRef = collection(this.firestore, 'ubicaciones');
      await addDoc(ubicacionesRef, {
        nombre: this.nombre,
        latitud: this.latitud,
        longitud: this.longitud,
        url: url,
        fecha: new Date(),
      });
      alert('Ubicación subida correctamente a la base de datos en Firebase');
      this.nombre = '';
    } catch (error) {
      console.error('Error al subir ubicación a la base de datos de Firebase:', error);
      alert('Error al subir ubicación a la base de datos en Firebase');
    }
  }
}