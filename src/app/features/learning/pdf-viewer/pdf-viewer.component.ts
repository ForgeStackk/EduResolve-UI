import { Component, inject, input, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { Location } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfViewerModule, TranslateModule, NgIf],
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.css']
})
export class PdfViewerComponent implements OnInit {
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  pdfSrcInput = input<string>();
  titleInput = input<string>('PDF Viewer');
  bookIdInput = input<number>();
  
  pdfSrc = signal<string>('');
  title = signal<string>('PDF Viewer');
  bookId = signal<number>(0);

  // View settings
  page: number = 1;
  totalPages: number = 0;
  isLoaded: boolean = false;
  zoom: number = 1.0;
  zoomStep: number = 0.2;
  fitToPage: boolean = true;
  
  // Mobile app features
  isFullscreen: boolean = false;
  darkMode: boolean = true;
  showToolbar: boolean = true;
  bookmarks: number[] = [];
  lastTap: number = 0;
  touchStartX: number = 0;
  touchStartY: number = 0;
  isDownloading: boolean = false;
  searchQuery: string = '';
  showSearch: boolean = false;
  
  // Share menu
  showShareMenu: boolean = false;
  shareOptions = [
    { name: 'WhatsApp', icon: 'chat', color: '#25D366', action: () => this.shareViaWhatsApp() },
    { name: 'Email', icon: 'mail', color: '#EA4335', action: () => this.shareViaEmail() },
    { name: 'Facebook', icon: 'facebook', color: '#1877F2', action: () => this.shareViaFacebook() },
    { name: 'Instagram', icon: 'photo_camera', color: '#E4405F', action: () => this.shareViaInstagram() },
    { name: 'Copy Link', icon: 'link', color: '#9CA3AF', action: () => this.copyLink() },
    { name: 'More', icon: 'more_horiz', color: '#6B7280', action: () => this.shareNative() }
  ];
  
  // More options menu
  showMoreMenu: boolean = false;
  
  // Reading progress
  readingProgress: number = 0;
  
  // Text selection mode
  textSelectionMode: boolean = false;
  
  // Thumbnail sidebar
  showThumbnails: boolean = false;

  ngOnInit(): void {
    // Check for input first, then query params
    const inputSrc = this.pdfSrcInput();
    if (inputSrc) {
      this.pdfSrc.set(inputSrc);
      const inputTitle = this.titleInput();
      if (inputTitle) {
        this.title.set(inputTitle);
      }
    } else {
      // Read from query params
      this.route.queryParams.subscribe(params => {
        const bookId    = params['bookId'];
        const pdfPath   = params['pdfPath'];
        const startPage = params['startPage'];
        const titleParam = params['title'];

        if (bookId) {
          this.pdfSrc.set(`${environment.apiBaseUrl}/ncert/books/${bookId}/pdf-content`);
        } else if (pdfPath) {
          this.pdfSrc.set(pdfPath);
        }

        if (titleParam) {
          this.title.set(titleParam);
        }

        if (startPage) {
          const pageNum = parseInt(startPage, 10);
          if (!isNaN(pageNum) && pageNum > 0) this.page = pageNum;
        }
      });
    }
  }

  afterLoadComplete(pdf: any): void {
    this.totalPages = pdf.numPages;
    this.isLoaded = true;
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
    }
  }

  zoomIn(): void {
    if (this.zoom < 3.0) {
      this.zoom += this.zoomStep;
    }
  }

  zoomOut(): void {
    if (this.zoom > 0.4) {
      this.zoom -= this.zoomStep;
    }
  }

  close(): void {
    if (this.isFullscreen) {
      this.exitFullscreen();
    }
    this.location.back();
  }

  // Fullscreen toggle
  toggleFullscreen(): void {
    if (!this.isFullscreen) {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      }
      this.isFullscreen = true;
    } else {
      this.exitFullscreen();
    }
  }

  exitFullscreen(): void {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    this.isFullscreen = false;
  }

  // Toggle toolbar visibility
  toggleToolbar(): void {
    this.showToolbar = !this.showToolbar;
  }

  // Bookmark current page
  toggleBookmark(): void {
    const index = this.bookmarks.indexOf(this.page);
    if (index > -1) {
      this.bookmarks.splice(index, 1);
    } else {
      this.bookmarks.push(this.page);
      this.saveBookmarks();
    }
  }

  isBookmarked(): boolean {
    return this.bookmarks.includes(this.page);
  }

  private saveBookmarks(): void {
    const key = `pdf_bookmarks_${this.bookId()}`;
    localStorage.setItem(key, JSON.stringify(this.bookmarks));
  }

  private loadBookmarks(): void {
    const key = `pdf_bookmarks_${this.bookId()}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      this.bookmarks = JSON.parse(saved);
    }
  }

  // Download PDF
  downloadPdf(): void {
    if (!this.pdfSrc()) return;
    
    this.isDownloading = true;
    this.http.get(this.pdfSrc(), { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.title()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.isDownloading = false;
      },
      error: () => {
        this.isDownloading = false;
        // Fallback: open in new tab
        window.open(this.pdfSrc(), '_blank');
      }
    });
  }

  // Toggle share menu
  toggleShareMenu(): void {
    this.showShareMenu = !this.showShareMenu;
    this.showMoreMenu = false;
  }

  // Toggle more options menu
  toggleMoreMenu(): void {
    this.showMoreMenu = !this.showMoreMenu;
    this.showShareMenu = false;
  }

  // Close all menus
  closeMenus(): void {
    this.showShareMenu = false;
    this.showMoreMenu = false;
    this.showSearch = false;
  }

  // Share via WhatsApp
  shareViaWhatsApp(): void {
    const text = `Check out this PDF: ${this.title()}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + window.location.href)}`;
    window.open(url, '_blank');
    this.showShareMenu = false;
  }

  // Share via Email
  shareViaEmail(): void {
    const subject = `PDF: ${this.title()}`;
    const body = `Check out this PDF: ${this.title()}\n\n${window.location.href}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    this.showShareMenu = false;
  }

  // Share via Facebook
  shareViaFacebook(): void {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'width=600,height=400');
    this.showShareMenu = false;
  }

  // Share via Instagram (copy to clipboard as Instagram doesn't support direct sharing)
  shareViaInstagram(): void {
    this.copyLink();
    alert('Link copied! You can now paste it in Instagram.');
    this.showShareMenu = false;
  }

  // Copy link to clipboard
  copyLink(): void {
    navigator.clipboard.writeText(window.location.href).then(() => {
      // Could show a toast notification here
      console.log('Link copied to clipboard');
    });
    this.showShareMenu = false;
  }

  // Native share (mobile)
  shareNative(): void {
    if (navigator.share) {
      navigator.share({
        title: this.title(),
        text: `Check out this PDF: ${this.title()}`,
        url: window.location.href
      }).catch(() => {
        // User cancelled
      });
    } else {
      this.copyLink();
    }
    this.showShareMenu = false;
  }

  // Toggle thumbnails sidebar
  toggleThumbnails(): void {
    this.showThumbnails = !this.showThumbnails;
    this.showMoreMenu = false;
  }

  // Toggle text selection mode
  toggleTextSelection(): void {
    this.textSelectionMode = !this.textSelectionMode;
    this.showMoreMenu = false;
  }

  // Toggle dark mode
  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    this.showMoreMenu = false;
  }

  // Update reading progress
  updateProgress(): void {
    if (this.totalPages > 0) {
      this.readingProgress = (this.page / this.totalPages) * 100;
    }
  }

  // Get window location for template
  getLocationHostname(): string {
    return window.location.hostname;
  }

  // Toggle search
  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) {
      this.searchQuery = '';
    }
  }

  // Double tap to zoom
  @HostListener('click', ['$event'])
  onDoubleTap(event: MouseEvent): void {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - this.lastTap;
    if (tapLength < 300 && tapLength > 0) {
      // Double tap detected
      if (this.zoom > 1.0) {
        this.zoom = 1.0;
        this.fitToPage = true;
      } else {
        this.zoom = 2.0;
        this.fitToPage = false;
      }
    }
    this.lastTap = currentTime;
  }

  // Touch gestures for swipe
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    
    const deltaX = this.touchStartX - touchEndX;
    const deltaY = this.touchStartY - touchEndY;
    
    // Horizontal swipe detection (only if not scrolling vertically)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // Swipe left - next page
        this.nextPage();
      } else {
        // Swipe right - prev page
        this.prevPage();
      }
    }
  }

  // Keyboard navigation
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ':
        this.nextPage();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        this.prevPage();
        break;
      case 'f':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.toggleSearch();
        }
        break;
      case 'Escape':
        if (this.showSearch) {
          this.showSearch = false;
        } else if (this.isFullscreen) {
          this.exitFullscreen();
        }
        break;
    }
  }

  // Go to specific page
  goToPage(pageNum: number): void {
    if (pageNum >= 1 && pageNum <= this.totalPages) {
      this.page = pageNum;
    }
  }

  // Reset zoom
  resetZoom(): void {
    this.zoom = 1.0;
    this.fitToPage = true;
  }
}
