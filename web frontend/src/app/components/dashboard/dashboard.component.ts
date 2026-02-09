import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Audio } from '../../models/audio.model';
import { User } from '../../models/user.model';
import { AudioService } from '../../services/audio.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  audioList: Audio[] = [];
  isLoading = false;
  errorMessage = '';
  showUploadModal = false;
  currentUser: User | null = null;
  editingAudio: Audio | null = null;
  newName = '';
  searchQuery = '';
  showFavoritesOnly = false;

  constructor(
    private audioService: AudioService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadAudioList();
  }

  loadCurrentUser(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: (error) => {
        console.error('Error loading current user:', error);
      }
    });
  }

  loadAudioList(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.audioService.getAudioList(this.searchQuery || undefined, this.showFavoritesOnly).subscribe({
      next: (audioList) => {
        this.audioList = audioList;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load audio files';
        this.isLoading = false;
        console.error('Error loading audio list:', error);
      }
    });
  }

  onSearchChange(): void {
    this.loadAudioList();
  }

  onFavoritesToggle(): void {
    this.showFavoritesOnly = !this.showFavoritesOnly;
    this.loadAudioList();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.loadAudioList();
  }

  playAudio(audio: Audio): void {
    this.audioService.playAudio(audio.path).subscribe({
      next: (response) => {
        console.log('Audio played:', response);
      },
      error: (error) => {
        console.error('Error playing audio:', error);
      }
    });
  }

  canEditAudio(audio: Audio): boolean {
    return this.currentUser !== null && this.currentUser.id === audio.uploadedById;
  }

  startRename(audio: Audio): void {
    this.editingAudio = audio;
    this.newName = audio.name;
  }

  cancelRename(): void {
    this.editingAudio = null;
    this.newName = '';
  }

  confirmRename(): void {
    if (this.editingAudio && this.newName.trim()) {
      this.audioService.renameAudio(this.editingAudio.id, this.newName.trim()).subscribe({
        next: (response) => {
          this.loadAudioList(); // Reload the list to get updated data
          this.cancelRename();
        },
        error: (error) => {
          console.error('Error renaming audio:', error);
          this.errorMessage = error.error?.message || 'Failed to rename audio file';
        }
      });
    }
  }

  toggleFavorite(audio: Audio): void {
    if (audio.isFavorited) {
      this.audioService.removeFromFavorites(audio.id).subscribe({
        next: (response) => {
          audio.isFavorited = false;
          // If we're showing favorites only and this was unfavorited, reload the list
          if (this.showFavoritesOnly) {
            this.loadAudioList();
          }
        },
        error: (error) => {
          console.error('Error removing from favorites:', error);
          this.errorMessage = error.error?.message || 'Failed to remove from favorites';
        }
      });
    } else {
      this.audioService.addToFavorites(audio.id).subscribe({
        next: (response) => {
          audio.isFavorited = true;
        },
        error: (error) => {
          console.error('Error adding to favorites:', error);
          this.errorMessage = error.error?.message || 'Failed to add to favorites';
        }
      });
    }
  }

  deleteAudio(audio: Audio): void {
    if (confirm(`Are you sure you want to delete "${audio.name}"?`)) {
      this.audioService.deleteAudio(audio.id).subscribe({
        next: () => {
          this.loadAudioList(); // Reload the list
        },
        error: (error) => {
          console.error('Error deleting audio:', error);
        }
      });
    }
  }

  openUploadModal(): void {
    this.showUploadModal = true;
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.loadAudioList(); // Reload after upload
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
