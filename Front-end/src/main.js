import './styles.css';
import {
  getNews,
  getCategories,
  getAgencies,
  extractNewsList,
  extractCategoriesList,
  extractAgenciesList,
  normalizeNewsItem
} from './api.js';
import {
  createTopBar,
  createNewsSlider,
  createFilterChips,
  createNewsCard,
  createLoadingSpinner,
  createErrorMessage,
  createFilterModal,
  createAgencyCheckboxItem,
  createFilterCategoryChip,
  createSelectedFilterTag
} from './components.js';

class NewsApp {
  constructor() {
    this.app = document.getElementById('app');
    this.currentSlide = 0;
    this.featuredSlideCount = 0;
    this.featuredNews = [];
    this.latestNews = [];
    this.categories = [];
    this.agencies = [];
    this.activeFilters = {};
    this.isLoading = false;
    this.isFilterModalOpen = false;
    this.selectedFilters = {
      agencies: [],
      categories: [],
      startDate: '',
      endDate: ''
    };

    // Pagination state for infinite scroll
    this.latestLimit = 10;
    this.latestOffset = 0;
    this.hasMoreLatest = true;
    this.isAppending = false;
    this.infiniteObserver = null;

    this.init();
  }

  async init() {
    try {
      await this.loadInitialData();
      this.render();
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.renderError('خطا در بارگذاری اولیه برنامه');
    }
  }

  async loadInitialData() {
    this.setLoading(true);
    try {
      // Fetch once and split: first 5 as featured, next 10 as latest
      const combinedResponse = await getNews({ limit: 15, offset: 0 });
      const allNews = extractNewsList(combinedResponse).map(normalizeNewsItem);
      // Featured: first 5 items that have an image
      const withImages = allNews.filter(n => Boolean(n.image_url));
      this.featuredNews = withImages.slice(0, 5);
      // Latest: exclude featured items (by id), up to 10
      const featuredIds = new Set(this.featuredNews.map(n => n.id));
      const remaining = allNews.filter(n => !featuredIds.has(n.id));
      this.latestNews = remaining.slice(0, 10);

      // Initialize pagination offsets for subsequent loads
      this.latestLimit = 10;
      // We requested 15 initially. Next page should start at offset 15 to avoid duplicates
      this.latestOffset = 15;
      // Assume more pages exist if initial request hit its limit
      this.hasMoreLatest = true;

      try {
        const [categoriesResponse, agenciesResponse] = await Promise.all([
          getCategories(),
          getAgencies()
        ]);
        this.categories = extractCategoriesList(categoriesResponse);
        this.agencies = extractAgenciesList(agenciesResponse);
      } catch {
        const allNews = [...this.featuredNews, ...this.latestNews];
        const uniqueCategories = new Map();
        const uniqueAgencies = new Map();
        allNews.forEach(n => {
          if (n?.category?.id && !uniqueCategories.has(n.category.id)) {
            uniqueCategories.set(n.category.id, n.category);
          }
          if (n?.agency?.id && !uniqueAgencies.has(n.agency.id)) {
            uniqueAgencies.set(n.agency.id, n.agency);
          }
        });
        this.categories = Array.from(uniqueCategories.values());
        this.agencies = Array.from(uniqueAgencies.values());
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
      this.featuredNews = [];
      this.latestNews = [];
      // Do not rethrow; allow UI to render with empty state instead of crashing
    } finally {
      this.setLoading(false);
    }
  }

  // Removed mock generator; only backend data is used

  setLoading(loading) {
    this.isLoading = loading;
  }

  render() {
    if (this.isLoading) {
      this.app.innerHTML = `
        <div class="news-app">
          ${createLoadingSpinner()}
        </div>
      `;
      return;
    }

    this.app.innerHTML = `
      <div class="news-app">
        ${createTopBar()}
        
        <main class="main-content">
          <section class="featured-news">
            <h2 class="section-title">خبرهای برگزیده</h2>
            ${this.featuredNews.length > 0 ? createNewsSlider(this.featuredNews) : '<p class="loading">خبری یافت نشد</p>'}
          </section>
          
          <section class="latest-news">
            <h2 class="section-title">آخرین خبرها</h2>
            ${createFilterChips(this.categories, this.agencies, this.activeFilters, this.selectedFilters)}
            
            <div class="news-list">
              ${this.renderNewsList()}
            </div>
          </section>
        </main>
      </div>
    `;
    // After render, setup infinite scroll
    this.setupInfiniteScroll();
  }

  renderNewsList() {
    if (this.latestNews.length === 0) {
      return '<p class="loading">خبری یافت نشد</p>';
    }

    const cardsHtml = this.latestNews.map((news) => {
      const hasImage = Boolean(news.image_url);
      return createNewsCard(news, hasImage);
    }).join('');

    // Sentinel at the end for infinite scroll
    const sentinel = `
      <div class="infinite-sentinel" style="padding: 16px; text-align: center; color: #91969F;">
        ${this.hasMoreLatest ? 'در حال بارگذاری بیشتر...' : 'تمام شد'}
      </div>
    `;

    return `${cardsHtml}${sentinel}`;
  }

  renderError(message) {
    this.app.innerHTML = `
      <div class="news-app">
        ${createErrorMessage(message)}
      </div>
    `;
  }

  setupEventListeners() {
    // Slider functionality
    this.setupSlider();
    
    // Filter functionality
    this.setupFilters();
    
    // News card clicks
    this.setupNewsCardClicks();
  }

  setupInfiniteScroll() {
    const container = document.querySelector('.news-list');
    if (!container) return;

    const sentinel = container.querySelector('.infinite-sentinel');
    if (!sentinel) return;

    // Disconnect previous observer if any
    if (this.infiniteObserver) {
      this.infiniteObserver.disconnect();
    }

    this.infiniteObserver = new IntersectionObserver(async (entries) => {
      const entry = entries[0];
      if (!entry || !entry.isIntersecting) return;
      await this.loadMoreNews();
    }, { root: null, rootMargin: '200px', threshold: 0 });

    this.infiniteObserver.observe(sentinel);
  }

  setupSlider() {
    const sliderTrack = document.querySelector('.slider-track');
    const dots = document.querySelectorAll('.slider-dot');
    
    // Determine how many slides actually rendered
    this.featuredSlideCount = document.querySelectorAll('.featured-card').length;
    if (!sliderTrack || this.featuredSlideCount === 0) return;

    // Auto-slide functionality
    this.sliderInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);

    // Dot click handlers
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.goToSlide(index);
      });
    });

    // Touch/swipe support for mobile
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    sliderTrack.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      clearInterval(this.sliderInterval);
    });

    sliderTrack.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    });

    sliderTrack.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      
      const diff = startX - currentX;
      if (Math.abs(diff) > 50) {
        // Swipe left (diff > 0) should go to next slide
        // and swipe right (diff < 0) should go to previous slide
        if (diff > 0) {
          this.prevSlide();
        } else {
          this.nextSlide();
        }
      }
      
      // Restart auto-slide
      this.sliderInterval = setInterval(() => {
        this.nextSlide();
      }, 5000);
    });
  }

  goToSlide(index) {
    const slideCount = this.featuredSlideCount || document.querySelectorAll('.featured-card').length || 0;
    if (slideCount === 0) return;
    const clampedIndex = Math.max(0, Math.min(index, slideCount - 1));
    this.currentSlide = clampedIndex;
    const sliderTrack = document.querySelector('.slider-track');
    const dots = document.querySelectorAll('.slider-dot');
    
    if (sliderTrack) {
      // Compute card width + gap dynamically from first card
      const firstCard = sliderTrack.querySelector('.featured-card');
      let cardWidth = 296;
      let gap = 16;
      if (firstCard) {
        const rect = firstCard.getBoundingClientRect();
        const style = window.getComputedStyle(firstCard);
        cardWidth = rect.width || cardWidth;
        gap = parseInt(style.marginRight, 10) || gap;
      }
      // For RTL layout, slides move to the right (positive translateX)
      const offset = clampedIndex * (cardWidth + gap);
      sliderTrack.style.transform = `translateX(${offset}px)`;
    }
    
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === clampedIndex);
    });
  }

  nextSlide() {
    const slideCount = this.featuredSlideCount || document.querySelectorAll('.featured-card').length || 0;
    if (slideCount === 0) return;
    const nextIndex = (this.currentSlide + 1) % slideCount;
    this.goToSlide(nextIndex);
  }

  prevSlide() {
    const slideCount = this.featuredSlideCount || document.querySelectorAll('.featured-card').length || 0;
    if (slideCount === 0) return;
    const prevIndex = this.currentSlide === 0 ? slideCount - 1 : this.currentSlide - 1;
    this.goToSlide(prevIndex);
  }

  setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-chip');
    
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const filterType = button.dataset.filter;
        this.handleFilterClick(filterType, button);
      });
    });
    
    // Setup remove buttons for selected filter chips
    this.setupRemoveButtons();
  }

  setupRemoveButtons() {
    const removeButtons = document.querySelectorAll('.selected-filter-chip-remove');
    console.log(`Found ${removeButtons.length} remove buttons to setup`);
    
    removeButtons.forEach((button, index) => {
      console.log(`Setting up remove button ${index}:`, button.dataset);
      // Remove any existing event listeners to prevent duplicates
      button.removeEventListener('click', this.handleRemoveFilter);
      button.addEventListener('click', this.handleRemoveFilter.bind(this));
    });
  }

  handleRemoveFilter(e) {
    e.stopPropagation();
    const button = e.currentTarget;
    const agencyId = button.dataset.agencyId;
    const categoryId = button.dataset.categoryId;
    
    if (agencyId) {
      this.removeSelectedFilter('agency', parseInt(agencyId));
    } else if (categoryId) {
      this.removeSelectedFilter('category', parseInt(categoryId));
    }
  }

  async handleFilterClick(filterType, buttonElement) {
    // Remove active class from all buttons
    document.querySelectorAll('.filter-chip').forEach(btn => {
      btn.classList.remove('active');
    });

    // Add active class to clicked button
    buttonElement.classList.add('active');

    // Handle different filter types
    switch (filterType) {
      case 'all':
        this.activeFilters = {};
        this.selectedFilters = {
          agencies: [],
          categories: [],
          startDate: '',
          endDate: ''
        };
        await this.loadLatestNews();
        break;
      case 'category':
        // In a real app, you'd show a category selector
        console.log('Category filter clicked');
        break;
      case 'date':
        // In a real app, you'd show a date picker
        console.log('Date filter clicked');
        break;
      case 'filter':
        // Show filter modal
        this.showFilterModal();
        break;
    }
  }

  async loadLatestNews(filters = {}) {
    try {
      this.setLoading(true);
      // Reset pagination for new filter set
      const limit = this.latestLimit || 10;
      const response = await getNews({ ...filters, limit, offset: 0 });
      const items = extractNewsList(response).map(normalizeNewsItem);
      this.latestNews = items;
      this.latestOffset = items.length;
      // Prefer API pagination.next if present; fallback to length===limit
      const nextHref = response?.meta?.pagination?.next || response?.data?.meta?.pagination?.next;
      this.hasMoreLatest = Boolean(nextHref) || items.length === limit;
      this.updateNewsList();
    } catch (error) {
      console.error('Failed to load news:', error);
      // In case of error, don't show empty list, keep existing news
    } finally {
      this.setLoading(false);
    }
  }

  async loadMoreNews() {
    if (this.isAppending || !this.hasMoreLatest) return;
    this.isAppending = true;
    try {
      const limit = this.latestLimit || 10;
      const offset = this.latestOffset || 0;
      const response = await getNews({ ...this.activeFilters, limit, offset });
      const items = extractNewsList(response).map(normalizeNewsItem);

      // Update pagination state
      this.latestOffset = offset + items.length;
      const nextHref = response?.meta?.pagination?.next || response?.data?.meta?.pagination?.next;
      this.hasMoreLatest = Boolean(nextHref) || items.length === limit;

      if (items.length > 0) {
        // Append to state
        this.latestNews.push(...items);

        // Append to DOM before sentinel
        const newsListContainer = document.querySelector('.news-list');
        const sentinel = newsListContainer?.querySelector('.infinite-sentinel');
        if (newsListContainer && sentinel) {
          const html = items.map((n) => createNewsCard(n, Boolean(n.image_url))).join('');
          sentinel.insertAdjacentHTML('beforebegin', html);
          // Update sentinel text if no more
          if (!this.hasMoreLatest) {
            sentinel.textContent = 'تمام شد';
          }
          // Reattach news card click handlers for new items
          this.setupNewsCardClicks();
        } else {
          // Fallback to full re-render if container missing
          this.updateNewsList();
        }
      } else {
        // No items returned; stop observing
        this.hasMoreLatest = false;
        const sentinel = document.querySelector('.infinite-sentinel');
        if (sentinel) sentinel.textContent = 'تمام شد';
      }
    } catch (e) {
      console.error('Failed to load more news:', e);
    } finally {
      this.isAppending = false;
    }
  }

  updateNewsList() {
    const newsListContainer = document.querySelector('.news-list');
    if (newsListContainer) {
      newsListContainer.innerHTML = this.renderNewsList();
      this.setupNewsCardClicks();
      this.setupInfiniteScroll();
    }
  }

  removeSelectedFilter(type, id) {
    console.log(`Removing ${type} filter with id: ${id}`);
    
    if (type === 'agency') {
      const index = this.selectedFilters.agencies.findIndex(a => a.id === id);
      if (index >= 0) {
        this.selectedFilters.agencies.splice(index, 1);
        console.log('Removed agency filter:', this.selectedFilters.agencies);
      }
    } else if (type === 'category') {
      const index = this.selectedFilters.categories.findIndex(c => c.id === id);
      if (index >= 0) {
        this.selectedFilters.categories.splice(index, 1);
        console.log('Removed category filter:', this.selectedFilters.categories);
      }
    }
    
    // Update the filter chips display
    this.updateFilterChips();
    
    // Reload news with updated filters
    this.applyFiltersFromSelected();
  }

  updateFilterChips() {
    const filterChipsContainer = document.querySelector('.filter-chips');
    if (filterChipsContainer) {
      filterChipsContainer.innerHTML = createFilterChips(this.categories, this.agencies, this.activeFilters, this.selectedFilters);
      this.setupFilters();
    }
  }

  applyFiltersFromSelected() {
    // Convert selected filters to API format
    const apiFilters = {};

    if (this.selectedFilters.agencies.length > 0) {
      apiFilters.agency_id = this.selectedFilters.agencies[0].id;
    }

    if (this.selectedFilters.categories.length > 0) {
      apiFilters.category_id = this.selectedFilters.categories[0].id;
    }

    // Store the filters
    this.activeFilters = { ...apiFilters };

    // Load filtered news
    this.loadLatestNews(apiFilters);
  }

  setupNewsCardClicks() {
    const newsCards = document.querySelectorAll('.news-card');
    newsCards.forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        const newsId = card.dataset.newsId;
        const newsItem = this.latestNews.find(news => news.id === newsId) || this.featuredNews.find(news => news.id === newsId);
        if (newsItem) this.openNewsDetail(newsItem);
      });
    });

    const featuredCards = document.querySelectorAll('.featured-card');
    featuredCards.forEach(card => {
      card.addEventListener('click', () => {
        const newsId = card.dataset.newsId;
        const newsItem = this.featuredNews.find(news => news.id === newsId) || this.latestNews.find(news => news.id === newsId);
        if (newsItem) this.openNewsDetail(newsItem);
      });
    });
  }

  openNewsDetail(newsItem) {
    // In a real app, you'd navigate to a detail page
    // For now, just open the link in a new tab
    if (newsItem.link && newsItem.link !== '#') {
      window.open(newsItem.link, '_blank');
    } else {
      console.log('News detail:', newsItem);
    }
  }

  showFilterModal() {
    this.isFilterModalOpen = true;
    this.renderFilterModal();
    this.setupFilterModalEvents();
  }

  hideFilterModal() {
    this.isFilterModalOpen = false;
    const modal = document.querySelector('.filter-modal-overlay');
    if (modal) {
      modal.remove();
    }
  }

  renderFilterModal() {
    const modalHtml = createFilterModal(this.agencies, this.categories, this.selectedFilters);
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  setupFilterModalEvents() {
    const modal = document.querySelector('.filter-modal-overlay');
    if (!modal) return;

    // Close modal on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.hideFilterModal();
      }
    });

    // Close button
    const closeBtn = modal.querySelector('.filter-modal-close');
    closeBtn?.addEventListener('click', () => {
      this.hideFilterModal();
    });

    // Dropdown toggle
    const dropdownToggle = modal.querySelector('.filter-dropdown-toggle');
    const dropdownContent = modal.querySelector('.filter-dropdown-content');
    dropdownToggle?.addEventListener('click', () => {
      dropdownContent?.classList.toggle('open');
    });

    // Agency checkboxes
    const agencyItems = modal.querySelectorAll('.filter-dropdown-item');
    agencyItems.forEach(item => {
      item.addEventListener('click', () => {
        this.toggleAgencyFilter(item);
      });
    });

    // Category chips
    const categoryChips = modal.querySelectorAll('.filter-category-chip');
    categoryChips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.toggleCategoryFilter(chip);
      });
    });

    // Remove selected filter tags
    const removeTags = modal.querySelectorAll('.selected-filter-tag-close');
    removeTags.forEach(tag => {
      tag.addEventListener('click', () => {
        this.removeSelectedFilterTag(tag);
      });
    });

    // Date inputs
    const dateInputs = modal.querySelectorAll('.filter-date-field');
    dateInputs.forEach(input => {
      input.addEventListener('change', () => {
        this.updateDateFilter(input);
      });
    });

    // Apply filter button
    const applyBtn = modal.querySelector('.filter-apply-btn');
    applyBtn?.addEventListener('click', () => {
      this.applyFilters();
    });

    // Clear filter button
    const clearBtn = modal.querySelector('.filter-clear-btn');
    clearBtn?.addEventListener('click', () => {
      this.clearFilters();
    });
  }

  toggleAgencyFilter(item) {
    const agencyId = parseInt(item.dataset.agencyId);
    const agency = this.agencies.find(a => a.id === agencyId);
    if (!agency) return;

    const existingIndex = this.selectedFilters.agencies.findIndex(a => a.id === agencyId);
    if (existingIndex >= 0) {
      // Remove agency
      this.selectedFilters.agencies.splice(existingIndex, 1);
    } else {
      // Add agency
      this.selectedFilters.agencies.push(agency);
    }

    // Update modal display
    this.updateFilterModal();
  }

  toggleCategoryFilter(chip) {
    const categoryId = parseInt(chip.dataset.categoryId);
    const category = this.categories.find(c => c.id === categoryId);
    if (!category) return;

    const existingIndex = this.selectedFilters.categories.findIndex(c => c.id === categoryId);
    if (existingIndex >= 0) {
      // Remove category
      this.selectedFilters.categories.splice(existingIndex, 1);
    } else {
      // Add category
      this.selectedFilters.categories.push(category);
    }

    // Update modal display
    this.updateFilterModal();
  }

  removeSelectedFilterTag(tag) {
    const agencyId = tag.closest('[data-agency-id]')?.dataset.agencyId;
    const categoryId = tag.closest('[data-category-id]')?.dataset.categoryId;

    if (agencyId) {
      const index = this.selectedFilters.agencies.findIndex(a => a.id === parseInt(agencyId));
      if (index >= 0) {
        this.selectedFilters.agencies.splice(index, 1);
      }
    }

    if (categoryId) {
      const index = this.selectedFilters.categories.findIndex(c => c.id === parseInt(categoryId));
      if (index >= 0) {
        this.selectedFilters.categories.splice(index, 1);
      }
    }

    // Update modal display
    this.updateFilterModal();
  }

  updateDateFilter(input) {
    const dateType = input.dataset.dateType;
    const value = input.value;

    if (dateType === 'start') {
      this.selectedFilters.startDate = value;
    } else if (dateType === 'end') {
      this.selectedFilters.endDate = value;
    }
  }

  updateFilterModal() {
    const modal = document.querySelector('.filter-modal-overlay');
    if (!modal) return;

    // Update agency checkboxes
    this.updateAgencyCheckboxes(modal);
    
    // Update category chips
    this.updateCategoryChips(modal);
    
    // Update selected agency tags
    this.updateSelectedAgencyTags(modal);
    
    // Re-setup event listeners for new elements
    this.setupFilterModalEvents();
  }

  updateAgencyCheckboxes(modal) {
    const agencyList = modal.querySelector('.filter-dropdown-list');
    if (!agencyList) return;

    const agencyCheckboxes = this.agencies.map(agency =>
      createAgencyCheckboxItem(agency, this.selectedFilters.agencies.some(sa => sa.id === agency.id))
    ).join('');

    agencyList.innerHTML = agencyCheckboxes;
  }

  updateCategoryChips(modal) {
    const categoryChipsContainer = modal.querySelector('.filter-category-chips');
    if (!categoryChipsContainer) return;

    const categoryChips = this.categories.map(category =>
      createFilterCategoryChip(category, this.selectedFilters.categories.some(sc => sc.id === category.id))
    ).join('');

    categoryChipsContainer.innerHTML = categoryChips;
  }

  updateSelectedAgencyTags(modal) {
    const selectedContainer = modal.querySelector('.filter-selected-container');
    if (!selectedContainer) return;

    if (this.selectedFilters.agencies.length > 0) {
      const selectedAgencyTags = this.selectedFilters.agencies.map(agency =>
        createSelectedFilterTag(agency, 'agency')
      ).join('');
      selectedContainer.innerHTML = selectedAgencyTags;
      selectedContainer.style.display = 'block';
    } else {
      selectedContainer.style.display = 'none';
    }
  }

  async applyFilters() {
    // Convert selected filters to API format
    const apiFilters = {};

    if (this.selectedFilters.agencies.length > 0) {
      // For multiple agencies, we might need to make multiple requests or use agency_id parameter
      // For now, let's use the first selected agency
      apiFilters.agency_id = this.selectedFilters.agencies[0].id;
    }

    if (this.selectedFilters.categories.length > 0) {
      // For multiple categories, use the first selected category
      apiFilters.category_id = this.selectedFilters.categories[0].id;
    }

    // Store the filters
    this.activeFilters = { ...apiFilters };

    // Close modal
    this.hideFilterModal();

    // Update filter chips display
    this.updateFilterChips();

    // Load filtered news
    await this.loadLatestNews(apiFilters);
  }

  clearFilters() {
    this.selectedFilters = {
      agencies: [],
      categories: [],
      startDate: '',
      endDate: ''
    };
    this.activeFilters = {};

    // Update modal display
    this.updateFilterModal();
    
    // Update filter chips display
    this.updateFilterChips();
    
    // Reload news without filters
    this.loadLatestNews();
  }

  destroy() {
    if (this.sliderInterval) {
      clearInterval(this.sliderInterval);
    }
    if (this.infiniteObserver) {
      this.infiniteObserver.disconnect();
      this.infiniteObserver = null;
    }
  }
}

// Initialize the app
let newsApp;

document.addEventListener('DOMContentLoaded', () => {
  newsApp = new NewsApp();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (newsApp) {
    newsApp.destroy();
  }
});

export default NewsApp;
