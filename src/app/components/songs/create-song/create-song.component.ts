import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SongService} from '../../../services/songs/song.service';
import {Router} from '@angular/router';
import {AngularFireStorage} from '@angular/fire/storage';
import {finalize} from 'rxjs/operators';
import {ISong} from '../../../interfaces/isong';
import {UserService} from '../../../services/user/user.service';
import {ArtistService} from '../../../services/artist/artist.service';
import {IArtist} from '../../../interfaces/iartist';


@Component({
  selector: 'app-create-song',
  templateUrl: './create-song.component.html',
  styleUrls: ['./create-song.component.css']
})
export class CreateSongComponent implements OnInit {
  createSongForm: FormGroup;
  fileSong: File;
  fileImage: File;
  song: ISong = {};
  id_user: number;
  artists: IArtist[] = [];
  artistsFilter = [];
  singers: number[] = [];
  authors: number[] = [];
  constructor(private storage: AngularFireStorage,
              private fb: FormBuilder,
              private songService: SongService,
              private router: Router,
              private userService: UserService,
              private artistService: ArtistService) {
  }


  ngOnInit(): void {
    this.id_user = +localStorage.getItem('userId');
    this.createSongForm = this.fb.group({
      name: [''],
      lyric: [''],
      authors: [''],
      singers: [''],
      description: ['']
    });
    this.artistService.getAll().subscribe(resp => {
      this.artists = resp;
    });
    this.artistService.getAll().subscribe(resp => {
      this.artistsFilter = resp;
    });
  }

  createSong(event) {
    const randomString = Math.random().toString(36).substring(7);
    const filePath = 'mp3/featured/' + randomString + new Date().getTime();
    this.fileSong = event.target.files[0];
    const fileRef = this.storage.ref(filePath);
    this.storage.upload(filePath, this.fileSong).snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(url => {
          this.song.fileUrl = url;
          console.log(url);
        });
      })
    ).subscribe();
  }

  createImage(event) {
    const randomString = Math.random().toString(36).substring(7);
    const filePath = 'image/featured/' + randomString + new Date().getTime();
    this.fileImage = event.target.files[0];
    const fileRef = this.storage.ref(filePath);
    this.storage.upload(filePath, this.fileImage).snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(url => {
          this.song.imageUrl = url;
          console.log(url);
        });
      })
    ).subscribe();
  }

  submit() {
    console.log("sending song ...");
    let data = this.createSongForm.value;
    this.song.name = data.name;
    this.song.description = data.description;
    this.song.lyric = data.lyric;
    this.song.s_singers = [];
    this.song.s_authors = [];
    console.log(this.song)
    for (let i = 0; i < this.singers.length; i++) {
      this.song.s_singers[i] = {};
      this.song.s_singers[i].id = this.singers[i];
    }
    for (let i = 0; i < this.authors.length; i++) {
      this.song.s_authors[i] = {};
      this.song.s_authors[i].id = this.authors[i];
    }
    this.song.postTime = new Date();
    this.songService.saveSong(this.song, this.id_user).subscribe(() => {
      console.log('Add song successful');
    });
    //Điều hướng sau khi post đi đâu tại đây
    // this.router.navigate("")

  }

  filterByArtist(artistName) {
    return this.artists.filter(
      artist => {
        return artist.fullName.indexOf(artistName) != -1;
      }
    );
  }
  findArtist(event) {
    this.artistsFilter = (event) ? this.filterByArtist(event) : this.artists;
  }
}
