// Frontend performance optimization utilities

// Lazy loading utilities
export const lazyLoad = {
  // Intersection Observer for lazy loading images
  createImageObserver(callback) {
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers
      return {
        observe: (element) => callback([{ target: element, isIntersecting: true }]),
        disconnect: () => {}
      };
    }

    return new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback([entry]);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });
  },

  // Lazy load images with placeholder
  loadImage(img, src, placeholder = '/images/placeholder.jpg') {
    return new Promise((resolve, reject) => {
      const image = new Image();
      
      image.onload = () => {
        img.src = src;
        img.classList.add('loaded');
        resolve(image);
      };
      
      image.onerror = () => {
        img.src = placeholder;
        reject(new Error('Failed to load image'));
      };
      
      image.src = src;
    });
  },

  // Progressive image loading
  loadProgressiveImage(container, sources) {
    const img = container.querySelector('img');
    if (!img) return;

    // Load low quality first
    if (sources.placeholder) {
      img.src = sources.placeholder;
      img.classList.add('placeholder');
    }

    // Then load high quality
    const highQualityImage = new Image();
    highQualityImage.onload = () => {
      img.src = sources.full;
      img.classList.remove('placeholder');
      img.classList.add('loaded');
    };
    highQualityImage.src = sources.full;
  }
};

// Debouncing and throttling
export const performanceHelpers = {
  debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },

  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Request animation frame throttling
  rafThrottle(func) {
    let rafId = null;
    return function(...args) {
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          func.apply(this, args);
          rafId = null;
        });
      }
    };
  }
};

// Memory management
export const memoryManager = {
  // Cleanup event listeners
  cleanupListeners(element, events) {
    events.forEach(({ type, listener, options }) => {
      element.removeEventListener(type, listener, options);
    });
  },

  // Cleanup intervals and timeouts
  cleanupTimers(timers) {
    timers.forEach(timer => {
      if (timer.type === 'interval') {
        clearInterval(timer.id);
      } else if (timer.type === 'timeout') {
        clearTimeout(timer.id);
      }
    });
  },

  // Cleanup observers
  cleanupObservers(observers) {
    observers.forEach(observer => {
      if (observer && typeof observer.disconnect === 'function') {
        observer.disconnect();
      }
    });
  }
};

// Caching utilities
export const cache = {
  // Simple in-memory cache
  memory: new Map(),

  set(key, value, ttl = 300000) { // 5 minutes default
    const expiry = Date.now() + ttl;
    this.memory.set(key, { value, expiry });
  },

  get(key) {
    const item = this.memory.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.memory.delete(key);
      return null;
    }
    
    return item.value;
  },

  has(key) {
    const item = this.memory.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiry) {
      this.memory.delete(key);
      return false;
    }
    
    return true;
  },

  delete(key) {
    return this.memory.delete(key);
  },

  clear() {
    this.memory.clear();
  },

  // Local storage cache with expiry
  localStorage: {
    set(key, value, ttl = 300000) {
      const expiry = Date.now() + ttl;
      const item = { value, expiry };
      localStorage.setItem(key, JSON.stringify(item));
    },

    get(key) {
      try {
        const item = JSON.parse(localStorage.getItem(key));
        if (!item) return null;
        
        if (Date.now() > item.expiry) {
          localStorage.removeItem(key);
          return null;
        }
        
        return item.value;
      } catch (error) {
        localStorage.removeItem(key);
        return null;
      }
    },

    has(key) {
      return this.get(key) !== null;
    },

    delete(key) {
      localStorage.removeItem(key);
    },

    clear() {
      localStorage.clear();
    }
  }
};

// Bundle optimization helpers
export const bundleOptimization = {
  // Dynamic imports for code splitting
  async loadComponent(componentPath) {
    try {
      const module = await import(componentPath);
      return module.default || module;
    } catch (error) {
      console.error(`Failed to load component: ${componentPath}`, error);
      throw error;
    }
  },

  // Preload critical resources
  preloadResource(href, as = 'script', crossorigin = null) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (crossorigin) link.crossOrigin = crossorigin;
    document.head.appendChild(link);
  },

  // Prefetch resources for future navigation
  prefetchResource(href) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }
};

// Performance monitoring
export const performanceMonitor = {
  // Measure function execution time
  measureFunction(func, name) {
    return function(...args) {
      const start = performance.now();
      const result = func.apply(this, args);
      const end = performance.now();
      console.log(`${name} took ${end - start} milliseconds`);
      return result;
    };
  },

  // Measure async function execution time
  async measureAsyncFunction(func, name) {
    const start = performance.now();
    const result = await func();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  },

  // Monitor component render time
  measureRender(componentName) {
    const start = performance.now();
    return {
      end() {
        const end = performance.now();
        console.log(`${componentName} render took ${end - start} milliseconds`);
      }
    };
  },

  // Get performance metrics
  getMetrics() {
    if (!('performance' in window)) return null;

    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');

    return {
      // Navigation timing
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      
      // Paint timing
      firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
      
      // Memory (if available)
      memory: performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      } : null
    };
  }
};

// Virtual scrolling for large lists
export class VirtualScroller {
  constructor(container, itemHeight, renderItem) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.renderItem = renderItem;
    this.items = [];
    this.visibleStart = 0;
    this.visibleEnd = 0;
    this.scrollTop = 0;
    
    this.init();
  }

  init() {
    this.container.style.overflow = 'auto';
    this.container.addEventListener('scroll', this.handleScroll.bind(this));
  }

  setItems(items) {
    this.items = items;
    this.updateVisibleRange();
    this.render();
  }

  handleScroll() {
    this.scrollTop = this.container.scrollTop;
    this.updateVisibleRange();
    this.render();
  }

  updateVisibleRange() {
    const containerHeight = this.container.clientHeight;
    const buffer = 5; // Render extra items for smooth scrolling
    
    this.visibleStart = Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - buffer);
    this.visibleEnd = Math.min(
      this.items.length,
      Math.ceil((this.scrollTop + containerHeight) / this.itemHeight) + buffer
    );
  }

  render() {
    const totalHeight = this.items.length * this.itemHeight;
    const offsetY = this.visibleStart * this.itemHeight;
    
    // Create or update container
    let viewport = this.container.querySelector('.virtual-scroll-viewport');
    if (!viewport) {
      viewport = document.createElement('div');
      viewport.className = 'virtual-scroll-viewport';
      viewport.style.height = `${totalHeight}px`;
      viewport.style.position = 'relative';
      this.container.appendChild(viewport);
    } else {
      viewport.style.height = `${totalHeight}px`;
    }

    // Clear existing items
    const itemsContainer = viewport.querySelector('.virtual-scroll-items') || document.createElement('div');
    itemsContainer.className = 'virtual-scroll-items';
    itemsContainer.style.transform = `translateY(${offsetY}px)`;
    itemsContainer.innerHTML = '';

    // Render visible items
    for (let i = this.visibleStart; i < this.visibleEnd; i++) {
      const item = this.renderItem(this.items[i], i);
      item.style.height = `${this.itemHeight}px`;
      itemsContainer.appendChild(item);
    }

    if (!viewport.contains(itemsContainer)) {
      viewport.appendChild(itemsContainer);
    }
  }

  destroy() {
    this.container.removeEventListener('scroll', this.handleScroll.bind(this));
    this.container.innerHTML = '';
  }
}

// Image optimization utilities
export const imageOptimization = {
  // Generate responsive image sources
  generateSrcSet(baseUrl, sizes = [300, 600, 900, 1200]) {
    return sizes.map(size => `${baseUrl}?w=${size} ${size}w`).join(', ');
  },

  // Generate sizes attribute
  generateSizes(breakpoints = [
    { media: '(max-width: 768px)', size: '100vw' },
    { media: '(max-width: 1200px)', size: '50vw' },
    { media: '', size: '33vw' }
  ]) {
    return breakpoints
      .map(bp => bp.media ? `${bp.media} ${bp.size}` : bp.size)
      .join(', ');
  },

  // Compress image on client side
  async compressImage(file, quality = 0.8, maxWidth = 1200) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }
};

// Export all utilities
export default {
  lazyLoad,
  performanceHelpers,
  memoryManager,
  cache,
  bundleOptimization,
  performanceMonitor,
  VirtualScroller,
  imageOptimization
};
