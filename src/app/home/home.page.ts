import { Component } from '@angular/core';
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
export class HomePage {
  nombre: string = '';
  latitude: number | null = null;
  longitude: number | null = null;
  locationEnabled: boolean = false;

  constructor(private firestore: Firestore) {}

  async getCurrentLocation() {
    try {
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      });

      this.latitude = coordinates.coords.latitude;
      this.longitude = coordinates.coords.longitude;
      console.log('Latitude:', this.latitude);
      console.log('Longitude:', this.longitude);
    } catch (error) {
      console.error('Error getting location', error);
    }
  }

  async enableLocation() {
    this.locationEnabled = true;
    await this.getCurrentLocation();
  }

  disableLocation() {
    this.locationEnabled = false;
    this.latitude = null;
    this.longitude = null;
  }

  abrirEnGoogleMaps() {
    if (this.latitude !== null && this.longitude !== null) {
      const url = `https://www.google.com/maps?q=${this.latitude},${this.longitude}`;
      window.open(url, '_blank');
    } else {
      alert('Ubicación no disponible');
    }
  }

  async subirUbicacionAFirebase() {
    if (!this.nombre) {
      alert('Por favor ingresa tu nombre.');
      return;
    }

    if (this.latitude === null || this.longitude === null) {
      alert('Primero debes obtener tu ubicación.');
      return;
    }

    const url = `https://www.google.com/maps?q=${this.latitude},${this.longitude}`;

    try {
      const ubicacionesRef = collection(this.firestore, 'ubicaciones');
      await addDoc(ubicacionesRef, {
        nombre: this.nombre,
        latitud: this.latitude,
        longitud: this.longitude,
        url: url,
        fecha: new Date(),
      });
      alert('Ubicación subida correctamente a Firebase');
      this.nombre = ''; // Limpiar nombre si se desea
    } catch (error) {
      console.error('Error al subir ubicación a Firebase:', error);
      alert('Error al subir ubicación');
    }
  }
}