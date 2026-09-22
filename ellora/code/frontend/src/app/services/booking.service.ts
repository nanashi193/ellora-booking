import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { BookingApiService, BookingItem } from './booking-api.service';
import { OwnerApiService, ownerError } from './owner-api.service';
@Injectable({ providedIn: 'root' })
export class BookingService implements OnDestroy {
  private api = inject(BookingApiService);
  private owner = inject(OwnerApiService);
  pendingBookings = signal<BookingItem[]>([]);
  pendingCount = signal(0);
  pendingIds = computed(() => this.pendingBookings().map(b => b.id).join(','));
  error = signal('');
  isLoading = signal(false);
  soundEnabled = signal(false);
  ringing = signal(false);
  soundError = signal('');
  private audio?: AudioContext;
  private tones: OscillatorNode[] = [];
  private poll?: ReturnType<typeof setInterval>;
  private stopTimer?: ReturnType<typeof setTimeout>;
  private seen = new Set<number>();
  private salonId?: number;
  private disposed = false;

  start(): void {
    if (this.poll) return;
    void this.loadSalonBookings();
    this.poll = setInterval(() => void this.loadSalonBookings(), 5000);
  }

  async enableSound(): Promise<void> {
    try {
      this.audio ??= new AudioContext();
      await this.audio.resume();
      if (this.disposed) return;
      this.soundEnabled.set(this.audio.state === 'running');
      this.soundError.set(this.soundEnabled() ? '' : 'Trình duyệt chưa cho phép âm thanh. Hãy bấm bật chuông lại.');
      this.alertNewBookings();
    } catch {
      this.soundError.set('Không bật được âm thanh trên trình duyệt này.');
    }
  }

  private alertNewBookings(): void {
    if (!this.soundEnabled() || this.audio?.state !== 'running') return;
    const unseen = this.pendingBookings().filter(b => !this.seen.has(b.id));
    if (!unseen.length) return;
    unseen.forEach(b => this.seen.add(b.id));
    try { sessionStorage.setItem('ellora-booking-alerts-' + this.salonId, JSON.stringify([...this.seen])); } catch { /* Storage can be disabled. */ }
    // A burst of bookings shares one 30-second alarm instead of extending it indefinitely.
    if (this.ringing()) return;
    this.ringing.set(true);
    const start = this.audio.currentTime;
    for (let offset = 0; offset < 29; offset += 1.2) {
      for (const [delay, frequency] of [[0, 880], [0.3, 660]]) {
        const tone = this.audio.createOscillator();
        const gain = this.audio.createGain();
        const at = start + offset + delay;
        tone.frequency.value = frequency;
        gain.gain.setValueAtTime(0, at);
        gain.gain.linearRampToValueAtTime(0.15, at + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, at + 0.28);
        tone.connect(gain); gain.connect(this.audio.destination);
        tone.onended = () => { tone.disconnect(); gain.disconnect(); };
        tone.start(at); tone.stop(at + 0.3);
        this.tones.push(tone);
      }
    }
    this.stopTimer = setTimeout(() => this.stopRinging(), 30000);
  }

  stopRinging(): void {
    clearTimeout(this.stopTimer);
    for (const tone of this.tones) { try { tone.stop(); } catch { /* Already stopped. */ } }
    this.tones = [];
    this.ringing.set(false);
  }

  ngOnDestroy(): void {
    this.disposed = true;
    clearInterval(this.poll);
    this.stopRinging();
    void this.audio?.close();
  }

  async loadSalonBookings(): Promise<void> {
    if (this.isLoading() || this.disposed) return;
    this.error.set('');
    this.isLoading.set(true);
    try {
      const salon = await this.owner.salon();
      if (this.salonId !== salon.id) {
        this.salonId = salon.id;
        try { this.seen = new Set(JSON.parse(sessionStorage.getItem('ellora-booking-alerts-' + salon.id) || '[]')); } catch { this.seen = new Set(); }
      }
      const page = await this.api.getSalonBookings(salon.id, 'PENDING', 0, 20);
      const bookings = [...page.content];
      for (let i = 1; i < page.totalPages; i++) {
        const next = await this.api.getSalonBookings(salon.id, 'PENDING', i, 20);
        bookings.push(...next.content);
      }
      if (this.disposed) return;
      this.pendingBookings.set(bookings);
      this.pendingCount.set(page.totalElements);
      if (!bookings.length) this.stopRinging();
      this.alertNewBookings();
    } catch (e) {
      this.pendingBookings.set([]);
      this.pendingCount.set(0);
      this.error.set(ownerError(e));
    } finally {
      this.isLoading.set(false);
    }
  }
}
