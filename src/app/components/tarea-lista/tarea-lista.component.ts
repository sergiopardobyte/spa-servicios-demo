import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { Tarea } from '../../models/tarea.model';
import { TareaService } from '../../services/tarea.service';

@Component({
  selector: 'app-tarea-lista',
  templateUrl: './tarea-lista.component.html',
  styleUrls: ['./tarea-lista.component.css']
})
export class TareaListaComponent implements OnInit {
  tareas$: Observable<Tarea[]> = this.tareaService.tareas$;

  nuevaTarea: Tarea = this.crearTareaVacia();
  guardando = false;

  constructor(private tareaService: TareaService) { }

  ngOnInit(): void {
    this.cargarTareas();
  }

  cargarTareas(): void {
    this.tareaService.getTareas().subscribe();
  }

  agregar(): void {
    const titulo = this.nuevaTarea.titulo.trim();
    const descripcion = this.nuevaTarea.descripcion.trim();

    if (!titulo || !descripcion || this.guardando) {
      return;
    }

    this.guardando = true;

    this.tareaService.agregarTarea({
      titulo,
      descripcion,
      completada: false,
      prioridad: this.nuevaTarea.prioridad
    }).subscribe({
      next: () => {
        this.nuevaTarea = this.crearTareaVacia();
        this.guardando = false;
      },
      error: () => {
        this.guardando = false;
      }
    });
  }

  eliminar(id: number | undefined): void {
    if (id === undefined) {
      return;
    }

    this.tareaService.eliminarTarea(id).subscribe();
  }

  private crearTareaVacia(): Tarea {
    return {
      titulo: '',
      descripcion: '',
      completada: false,
      prioridad: 'Media'
    };
  }
}
