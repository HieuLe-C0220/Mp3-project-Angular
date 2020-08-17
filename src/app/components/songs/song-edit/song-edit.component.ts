import { Component, OnInit } from '@angular/core';
import {SongService} from '../../../services/songs/song.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ISong} from '../../../interfaces/isong';
import {finalize} from 'rxjs/operators';
import {AngularFireStorage} from '@angular/fire/storage';
import {IArtist} from '../../../interfaces/iartist';
import {ArtistService} from '../../../services/artist/artist.service';

@Component({
  selector: 'app-song-edit',
  templateUrl: './song-edit.component.html',
  styleUrls: ['./song-edit.component.css']
})
export class SongEditComponent implements OnInit {
  editSongForm: FormGroup;
  song: ISong;
  fileSong: File;
  fileImage: File;
  songUrl: string = '';
  imageUrl: string = '';
  user_id: number;
  singers: IArtist[] = [];
  singersFilter = [];
  authors: IArtist[] = [];
  authorsFilter = [];
  singersSelected: number[] = [];
  authorsSelected: number[] = [];

  constructor(private songService: SongService,
              private fb: FormBuilder,
              private rt: Router,
              private ac: ActivatedRoute,
              private storage: AngularFireStorage,
              private artistService: ArtistService
              ) { }
  id: number = +this.ac.snapshot.paramMap.get('id');
  ngOnInit(): void {
    this.songService.getSongById(this.id).subscribe( resp => {
      this.song = resp;
      this.editSongForm = this.fb.group({
        category: [''],
        name: [this.song.name],
        lyric: [this.song.lyric],
        description: [this.song.description]
      });
      this.songUrl = this.song.fileUrl;
      this.imageUrl = this.song.imageUrl;
    });
    this.artistService.getAll().subscribe(resp =>{
      this.singers = resp;
    });
    this.artistService.getAll().subscribe(resp =>{
      this.authors = resp;
    });
    this.artistService.getAll().subscribe(resp =>{
      this.singersFilter = resp;
    });
    this.artistService.getAll().subscribe(resp =>{
      this.authorsFilter = resp;
    });
  }

  submit(){
   let data = this.editSongForm.value;
   this.song.name = data.name;
   this.song.lyric = data.lyric;
   this.song.description = data.description;
   if(this.songUrl != '')
     this.song.fileUrl = this.songUrl;
    if(this.imageUrl != '')
      this.song.imageUrl = this.imageUrl;
   if(this.singers.length > 0){
     for (let i = 0; i < this.singersSelected.length; i++) {
       this.song.s_singers[i] = {};
       this.song.s_singers[i].id = this.singersSelected[i];
     }
   }
   if( this.authors.length > 0){
     for (let i = 0; i < this.authorsSelected.length; i++) {
       this.song.s_authors[i] = {};
       this.song.s_authors[i].id = this.authorsSelected[i];
     }
   }
   this.songService.saveSong(this.song,+localStorage.getItem('userId')).subscribe(()=>{
     console.log("edit ok");
   });
   this.rt.navigate(["/user/songs"]);
  }
  updateSong(event){
    const randomString = Math.random().toString(36).substring(7);
    const filePath = 'mp3/featured/' +randomString+new Date().getTime();
    this.fileSong = event.target.files[0];
    const fileRef = this.storage.ref(filePath);
    this.storage.upload(filePath,this.fileSong).snapshotChanges().pipe(
      finalize(() =>{
        fileRef.getDownloadURL().subscribe(url =>{
          this.songUrl = url;
          console.log(url);
        })
      })
    ).subscribe();
  }
  updateImage(event){
    const randomString = Math.random().toString(36).substring(7);
    const filePath = 'image/featured/' +randomString+new Date().getTime();
    this.fileImage = event.target.files[0];
    const fileRef = this.storage.ref(filePath);
    this.storage.upload(filePath,this.fileImage).snapshotChanges().pipe(
      finalize(() =>{
        fileRef.getDownloadURL().subscribe(url =>{
          this.imageUrl = url;
          console.log(url);
        })
      })
    ).subscribe();
  }
  filterByArtist(artistName,artists: IArtist[]) {
    return artists.filter(
      artist => {
        return artist.fullName.indexOf(artistName) != -1;
      }
    );
  }
  findAuthors(event) {
    this.authorsFilter = (event) ? this.filterByArtist(event,this.authors) : this.authors;
  }
  findSingers(event) {
    this.singersFilter = (event) ? this.filterByArtist(event,this.singers) : this.singers;
  }
}
