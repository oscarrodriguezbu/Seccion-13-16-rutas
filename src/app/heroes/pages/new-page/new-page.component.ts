import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, switchMap, tap } from 'rxjs';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { Publisher, Hero } from '../../interfaces/hero.interface';
import { HeroesService } from '../../services/heroes.service';

import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-new-page',
  templateUrl: './new-page.component.html',
  styles: [
  ]
})
export class NewPageComponent implements OnInit {

  public heroForm = new FormGroup({
    id:        new FormControl<string>(''),
    superhero: new FormControl<string>('', { nonNullable: true }),
    publisher: new FormControl<Publisher>( Publisher.DCComics ),
    alter_ego: new FormControl(''),
    first_appearance: new FormControl(''),
    characters: new FormControl(''),
    alt_img:    new FormControl(''),
  });

  public publishers = [
    { id: 'DC Comics', desc: 'DC - Comics' },
    { id: 'Marvel Comics', desc: 'Marvel - Comics' },
  ];


  constructor(
    private heroesService: HeroesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  get currentHero(): Hero {
    const hero = this.heroForm.value as Hero; //esto es para solucionar un problema de compatibilidad de tips en la funcion onSubmit
    return hero;
  }

  ngOnInit(): void {

    if ( !this.router.url.includes('edit') ) return;

    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.heroesService.getHeroById( id ) ),
      ).subscribe( hero => {

        if ( !hero ) {
          return this.router.navigateByUrl('/');
        }

        this.heroForm.reset( hero ); // coloca valores por defecto
        return;
      });

  }



  onSubmit():void {

    if ( this.heroForm.invalid ) return;

    // Actualizar
    if ( this.currentHero.id ) {
      this.heroesService.updateHero( this.currentHero )
        .subscribe( hero => {
          this.showSnackbar(`${ hero.superhero } updated!`);
        });

      return;
    }

    // Crear
    this.heroesService.addHero( this.currentHero )
      .subscribe( hero => {
        // TODO: mostrar snackbar, y navegar a /heroes/edit/ hero.id
        this.router.navigate(['/heroes/edit', hero.id ]);
        this.showSnackbar(`${ hero.superhero } created!`); // snackbar viene de material
      });
  }

  onDeleteHero() {
    if ( !this.currentHero.id ) throw Error('Hero id is required');

    const dialogRef = this.dialog.open( ConfirmDialogComponent, {
      data: this.heroForm.value
    });

    //version optimizada
    dialogRef.afterClosed()
      .pipe(
        filter( (result: boolean) => result ), //filtro de rxjs. Es una condicion para continuar o no
        switchMap( () => this.heroesService.deleteHeroById( this.currentHero.id )), // se dispara el observable de eliminar
        filter( (wasDeleted: boolean) => wasDeleted ), //otro filtro para ver si eliminó o no
      )
      .subscribe(() => {
        this.router.navigate(['/heroes']); //redirecciona al terminar
      });

    // dialogRef.afterClosed().subscribe(result => {
    //   if ( !result ) return;

    //   this.heroesService.deleteHeroById( this.currentHero.id )
    //   .subscribe( wasDeleted => {
    //     if ( wasDeleted )
    //       this.router.navigate(['/heroes']);
    //   })
    // });

  }


  showSnackbar( message: string ):void {
    this.snackbar.open( message, 'done', { // snackbar viene de material
      duration: 2500,
    })
  }

}
