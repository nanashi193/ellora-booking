import { Injectable, signal } from '@angular/core';
import { Salon, Service, Staff, Review, Promotion, Category } from '../models/ellora.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  
  public salons = signal<Salon[]>([
    {
      id: 's1',
      name: 'Lumina Nail Studio',
      description: 'A sanctuary for premium nail care and innovative artistry. We combine top-tier hygiene standards with avant-garde designs in a serene, minimalist environment designed to help you unwind.',
      address: '123 Spring Street',
      city: 'New York, NY 10012',
      coordinates: { lat: 40.724, lng: -74.000 },
      rating: 4.9,
      reviewCount: 128,
      images: [
        'https://picsum.photos/seed/lumina1/800/600',
        'https://picsum.photos/seed/lumina2/400/300',
        'https://picsum.photos/seed/lumina3/400/300'
      ],
      distance: 1.2,
      isOpen: true,
      nextAvailable: new Date().toISOString()
    },
    {
      id: 's2',
      name: 'The Petal Spa',
      description: 'Relax and rejuvenate at The Petal Spa. Offering luxury manicures and organic pedicures.',
      address: '45 Westside Ave',
      city: 'New York, NY 10014',
      coordinates: { lat: 40.730, lng: -74.010 },
      rating: 4.7,
      reviewCount: 84,
      images: [
        'https://picsum.photos/seed/petal1/800/600'
      ],
      distance: 2.5,
      isOpen: true,
      nextAvailable: new Date(Date.now() + 86400000).toISOString() // tomorrow
    },
    {
      id: 's3',
      name: 'Aesthetic Nails',
      description: 'Specializing in acrylics and complex designs.',
      address: '78 East Village Rd',
      city: 'New York, NY 10003',
      coordinates: { lat: 40.728, lng: -73.990 },
      rating: 4.8,
      reviewCount: 205,
      images: [
        'https://picsum.photos/seed/aesthetic1/800/600'
      ],
      distance: 3.1,
      isOpen: false,
      nextAvailable: new Date().toISOString()
    },
    {
      id: 's4',
      name: 'The Polish Bar',
      description: 'Express services & vibrant colors.',
      address: '12 Downtown St',
      city: 'New York, NY 10005',
      coordinates: { lat: 40.705, lng: -74.010 },
      rating: 4.6,
      reviewCount: 42,
      images: [
        'https://picsum.photos/seed/polishbar1/800/600'
      ],
      distance: 0.8,
      isOpen: true,
      nextAvailable: new Date().toISOString()
    }
  ]);

  public services = signal<Service[]>([
    {
      id: 'srv1',
      salonId: 's1',
      name: 'Signature Gel Manicure',
      description: 'Detailed cuticle care, shaping, and application of premium long-lasting gel polish.',
      durationMinutes: 60,
      price: 65
    },
    {
      id: 'srv2',
      salonId: 's1',
      name: 'Apres Gel-X Extensions',
      description: 'Flawless, lightweight extensions offering superior durability and a natural look. Includes a solid gel color.',
      durationMinutes: 90,
      price: 110
    },
    {
      id: 'srv3',
      salonId: 's1',
      name: 'Custom Nail Art (Tier 2)',
      description: 'Intricate designs on up to 4 nails. Think French tips, aura nails, or complex linework.',
      durationMinutes: 30,
      price: 35
    }
  ]);

  public staff = signal<Staff[]>([
    { id: 'stf1', salonId: 's1', name: 'Anna', role: 'Nail Tech', avatar: 'https://i.pravatar.cc/150?u=anna' },
    { id: 'stf2', salonId: 's1', name: 'Ben', role: 'Massage Therapist', avatar: 'https://i.pravatar.cc/150?u=ben' },
    { id: 'stf3', salonId: 's1', name: 'Chloe', role: 'Esthetician', avatar: 'https://i.pravatar.cc/150?u=chloe' }
  ]);

  public reviews = signal<Review[]>([
    {
      id: 'r1',
      salonId: 's1',
      authorId: 'u1',
      authorName: 'Sarah Jenkins',
      rating: 5,
      comment: 'Absolutely stunning work! I came in for Gel-X with some complex aura art and Maya executed it perfectly. The salon is beautifully minimal and impeccably clean. Highly recommend.',
      date: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    },
    {
      id: 'r2',
      salonId: 's1',
      authorId: 'u2',
      authorName: 'Mia Chen',
      rating: 5,
      comment: 'Consistently the best manicure in the city. The attention to detail during cuticle prep is unmatched.',
      date: new Date(Date.now() - 604800000).toISOString() // 1 week ago
    }
  ]);

  public categories = signal<Category[]>([
    { id: 'c1', name: 'Manicure', slug: 'manicure' },
    { id: 'c2', name: 'Pedicure', slug: 'pedicure' },
    { id: 'c3', name: 'Nail Art', slug: 'nail-art' },
    { id: 'c4', name: 'Extensions', slug: 'extensions' },
    { id: 'c5', name: 'Brows & Lashes', slug: 'brows-lashes' }
  ]);

  constructor() {}
}
