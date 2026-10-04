import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RevealOnScrollDirective } from './reveal-on-scroll.directive';

@Component({
  standalone: true,
  imports: [RevealOnScrollDirective],
  template: '<div appRevealOnScroll="fade-up" [revealDuration]="10000">Content</div>',
})
class RevealHost {}

describe('RevealOnScrollDirective', () => {
  let fixture: ComponentFixture<RevealHost>;
  let observerCallback: IntersectionObserverCallback;
  let observer: MockIntersectionObserver;

  class MockIntersectionObserver {
    observe = vi.fn();
    disconnect = vi.fn();

    constructor(callback: IntersectionObserverCallback) {
      observerCallback = callback;
      observer = this;
    }
  }

  beforeEach(async () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    });
    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      value: MockIntersectionObserver,
    });

    await TestBed.configureTestingModule({ imports: [RevealHost] }).compileComponents();
    fixture = TestBed.createComponent(RevealHost);
  });

  afterEach(() => fixture.destroy());

  it('updates host bindings when the element enters the viewport', async () => {
    fixture.detectChanges();
    const element = fixture.nativeElement.querySelector('div') as HTMLElement;

    expect(element.style.opacity).toBe('0');

    observerCallback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      observer as unknown as IntersectionObserver,
    );
    await fixture.whenStable();

    expect(element.style.opacity).toBe('1');
    expect(element.classList.contains('reveal-has-entered')).toBe(true);
    expect(observer.disconnect).toHaveBeenCalledOnce();
  });
});
