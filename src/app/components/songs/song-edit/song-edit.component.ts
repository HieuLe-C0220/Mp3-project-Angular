import { Component, OnInit } from '@angular/core';
import {SongService} from '../../../services/songs/song.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ISong} from '../../../interfaces/isong';
import {finalize} from 'rxjs/operators';
import {AngularFireStorage} from '@angular/fire/storage';

@Component({
  selector: 'app-song-edit',
  templateUrl: './song-edit.component.html',
  styleUrls: ['./song-edit.component.css']
})
export class SongEditComponent implements OnInit {
  editSongForm: FormGroup;
  song: ISong = {};
  fileSong: File;
  fileImage: File;
  songUrl: string = '';
  imageUrl: string = '';

  constructor(private songService: SongService,
              private fb: FormBuilder,
              private rt: Router,
              private ac: ActivatedRoute,
              private storage: AngularFireStorage
              ) { }
  id: number = +this.ac.snapshot.paramMap.get('id');
  ngOnInit(): void {
    this.songService.getSongById(this.id).subscribe( resp =>{
      this.song = resp;
      this.editSongForm = this.fb.group({
        id: [this.song.id],
        name: [this.song.name],
        lyric: [this.song.lyric],
        authors: [this.song.authors],
        singers: [this.song.singers],
        description : [this.song.description],
      })
    });

  }
  submit(){
   let data = this.editSongForm.value;
   this.song = data;
   this.song.fileUrl = this.songUrl;
   this.song.imageUrl = this.imageUrl;
   this.songService.saveSong(this.song).subscribe(()=>{
     console.log("edit ok")
   })
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
  updateImage(event){const randomString = Math.random().toString(36).substring(7);
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
}
