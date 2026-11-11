
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, retry, tap } from 'rxjs/operators';

import { Tarea } from '../models/tarea.model';

interface ApiTodo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TareaService {

  private readonly apiUrl = 'https://jsonplaceholder.typicode.com/todos';

  // Tareas de respaldo en español
  private tareasMemoria: Tarea[] = [
    {
      id: 1,
      titulo: 'Diseñar arquitectura SPA',
      descripcion: 'Definir las rutas y los servicios de la aplicación.',
      completada: true,
      prioridad: 'Alta'
    },
    {
      id: 2,
      titulo: 'Integrar HttpClient',
      descripcion: 'Conectar la aplicación con una API REST y RxJS.',
      completada: false,
      prioridad: 'Alta'
    },
    {
      id: 3,
      titulo: 'Preparar el informe del proyecto',
      descripcion: 'Organizar la información y documentar los avances.',
      completada: false,
      prioridad: 'Media'
    },
    {
      id: 4,
      titulo: 'Diseñar la interfaz de usuario',
      descripcion: 'Mejorar la presentación visual de la aplicación.',
      completada: true,
      prioridad: 'Media'
    },
    {
      id: 5,
      titulo: 'Verificar la seguridad',
      descripcion: 'Comprobar el funcionamiento del interceptor y Guard.',
      completada: false,
      prioridad: 'Baja'
    },
    {
      id: 6,
      titulo: 'Realizar pruebas',
      descripcion: 'Verificar el registro y eliminación de tareas.',
      completada: false,
      prioridad: 'Alta'
    }
  ];

  private readonly tareasSubject =
    new BehaviorSubject<Tarea[]>(this.tareasMemoria);

  readonly tareas$ = this.tareasSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Consultar tareas desde la API REST
  getTareas(): Observable<Tarea[]> {

    return this.http.get<ApiTodo[]>(`${this.apiUrl}?_limit=6`).pipe(

      retry(1),

      map((datos) => datos.map((dato): Tarea => {

        // Se reemplazan los títulos en inglés por títulos en español
        const tareasEspanol: Tarea[] = [
          {
            id: 1,
            titulo: 'Organizar las actividades del proyecto',
            descripcion: 'Revisar las actividades pendientes y establecer un orden de trabajo.',
            completada: false,
            prioridad: 'Baja'
          },
          {
            id: 2,
            titulo: 'Preparar el informe de avances',
            descripcion: 'Redactar un resumen de los avances realizados.',
            completada: false,
            prioridad: 'Media'
          },
          {
            id: 3,
            titulo: 'Revisar los servicios REST',
            descripcion: 'Comprobar las solicitudes HTTP y la comunicación con la API.',
            completada: false,
            prioridad: 'Alta'
          },
          {
            id: 4,
            titulo: 'Diseñar la interfaz de usuario',
            descripcion: 'Mejorar la presentación visual del panel de tareas.',
            completada: false,
            prioridad: 'Media'
          },
          {
            id: 5,
            titulo: 'Verificar la seguridad de las rutas',
            descripcion: 'Comprobar el funcionamiento del Guard de autenticación.',
            completada: false,
            prioridad: 'Baja'
          },
          {
            id: 6,
            titulo: 'Realizar pruebas de la aplicación',
            descripcion: 'Probar el registro y la eliminación de tareas.',
            completada: false,
            prioridad: 'Alta'
          }
        ];

        const tareaEspanol = tareasEspanol[(dato.id - 1) % tareasEspanol.length];

        return {
          ...tareaEspanol,
          id: dato.id,
          completada: dato.completed
        };
      })),

      tap((tareas) => {
        this.tareasMemoria = tareas;
        this.tareasSubject.next(tareas);
      }),

      catchError((error: HttpErrorResponse) => {
        console.error(
          'Error al consultar la API:',
          error.message
        );

        // Mostrar las tareas locales si falla la API
        this.tareasSubject.next(this.tareasMemoria);

        return of(this.tareasMemoria);
      })
    );
  }

  // Agregar una nueva tarea
  agregarTarea(tarea: Tarea): Observable<Tarea> {

    return this.http.post<ApiTodo>(this.apiUrl, {
      title: tarea.titulo,
      completed: tarea.completada,
      userId: 1
    }).pipe(

      map((respuesta) => ({
        ...tarea,
        id: respuesta.id || Date.now()
      })),

      catchError(() => of({
        ...tarea,
        id: Date.now()
      })),

      tap((nuevaTarea) => {
        this.tareasMemoria = [
          ...this.tareasSubject.value,
          nuevaTarea
        ];

        this.tareasSubject.next(this.tareasMemoria);
      })
    );
  }

  // Eliminar una tarea
  eliminarTarea(id: number): Observable<boolean> {

    return this.http.delete(`${this.apiUrl}/${id}`).pipe(

      map(() => true),

      catchError(() => of(true)),

      tap(() => {
        this.tareasMemoria =
          this.tareasSubject.value.filter(
            tarea => tarea.id !== id
          );

        this.tareasSubject.next(this.tareasMemoria);
      })
    );
  }

  // Manejo centralizado de errores
  private manejarError(error: HttpErrorResponse) {

    console.error(
      'Error en la comunicación HTTP:',
      error.message
    );

    return throwError(
      () => new Error('Error en el servicio REST. Intente más tarde.')
    );
  }
}
