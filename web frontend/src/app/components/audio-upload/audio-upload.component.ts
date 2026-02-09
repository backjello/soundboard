import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-audio-upload',
  templateUrl: './audio-upload.component.html',
  styleUrls: ['./audio-upload.component.scss']
})
export class AudioUploadComponent {
  @Output() uploadComplete = new EventEmitter<void>();

  uploadForm: FormGroup;
  selectedFile: File | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private audioService: AudioService
  ) {
    this.uploadForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      file: ['', [Validators.required]]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/flac', 'audio/aac'];
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = 'Please select a valid audio file (MP3, WAV, OGG, M4A, FLAC, AAC)';
        return;
      }

      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        this.errorMessage = 'File size must be less than 2MB';
        return;
      }

      this.selectedFile = file;
      this.errorMessage = '';
      this.uploadForm.patchValue({ file: file });

      // Auto-fill name if empty
      if (!this.uploadForm.get('name')?.value) {
        const fileName = file.name.split('.')[0];
        this.uploadForm.patchValue({ name: fileName });
      }
    }
  }

  onSubmit(): void {
    if (this.uploadForm.valid && this.selectedFile) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const uploadData = {
        name: this.uploadForm.get('name')?.value,
        file: this.selectedFile
      };

      this.audioService.uploadAudio(uploadData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Audio uploaded successfully!';
          setTimeout(() => {
            this.uploadComplete.emit();
          }, 1500);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Upload failed. Please try again.';
        }
      });
    }
  }

  cancel(): void {
    this.uploadComplete.emit();
  }
}
