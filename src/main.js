import './styles.css';
import { 
  getNews, 
  getCategories, 
  getAgencies, 
  getFeaturedNews,
  mockData 
} from './api.js';
import {
  createTopBar,
  createNewsSlider,
  createFilterChips,
  createNewsCard,
  createLoadingSpinner,
  createErrorMessage
} from './components.js';

class NewsApp {
  constructor() {
    this.app = document.getElementById('app');
    this.currentSlide = 0;
    this.featuredNews = [];
    this.latestNews = [];
    this.categories = [];
    this.agencies = [];
    this.activeFilters = {};
    this.isLoading = false;
    
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
      // Try to load real data first, fallback to mock data
      try {
        const [featuredResponse, latestResponse, categoriesResponse, agenciesResponse] = await Promise.all([
          getFeaturedNews(5),
          getNews({ limit: 10 }),
          getCategories(),
          getAgencies()
        ]);

        this.featuredNews = featuredResponse.data?.news || [];
        this.latestNews = latestResponse.data?.news || [];
        this.categories = categoriesResponse.data?.categories || [];
        this.agencies = agenciesResponse.data?.agencies || [];
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError);
        // Use mock data
        this.categories = mockData.categories;
        this.agencies = mockData.agencies;
        
        // Generate some mock news
        this.featuredNews = this.generateMockNews(5, true);
        this.latestNews = this.generateMockNews(10, false);
      }
    } finally {
      this.setLoading(false);
    }
  }

  generateMockNews(count, featured = false) {
    const mockTitles = [
      'ترامپ: آمریکا در صورت ادامه تشدید اقدامات روسیه، به دفاع از لهستان کمک خواهد کرد',
      'وزیر خارجه ایران: گفت‌وگوها برای احیای برجام ادامه دارد',
      'آلمان: نگران بحران انسانی در اوکراین هستیم',
      'بانک‌ها به استانداردسازی صدور تأییدیه‌های اعتباری ملزم شدند',
      'حمله هوایی به مواضع داعش در سوریه',
      'ذخایر استراتژیک دارو برای مقابله با اثرات فعال‌سازی مکانیسم ماشه شدند',
      'نگران بحران انسانی در اوکراین هستیم',
      'جلسه مهم کابینه درباره وضعیت اقتصادی کشور',
      'کاهش قیمت نفت در بازارهای جهانی',
      'افزایش صادرات محصولات کشاورزی'
    ];

    const mockContents = [
      'دونالد ترامپ، رئیس جمهور امریکا در پاسخ به سوال خبرنگار مبنی بر این که «آیا در صورت ادامه تشدید تنش‌ها توسط روسیه، به دفاع از لهستان کمک خواهد کرد یا خیر» گفت: «من این کار را خواهم کرد»',
      'حسین امیرعبداللهیان گفت: «ما همچنان امیدواریم که مذاکرات به نتیجه برسد و منافع ملت ایران تأمین شود»',
      'وزیر امور خارجه آلمان اعلام کرد که کشورش از ادامه حمایت‌های بشردوستانه به مردم اوکراین حمایت خواهد کرد.',
      'بانک مرکزی اعلام کرد که تمامی بانک‌ها ملزم به رعایت استانداردهای جدید هستند.',
      'نیروهای ائتلاف بین‌المللی موفق به هدف‌گیری چندین موضع گروه داعش در شمال سوریه شدند.',
      'وزارت بهداشت اعلام کرد که ذخایر دارویی کشور در وضعیت مطلوبی قرار دارد.',
      'سازمان ملل نسبت به وضعیت انسان‌دوستانه در منطقه ابراز نگرانی کرد.',
      'رئیس جمهور در جلسه کابینه بر ضرورت اقدامات فوری اقتصادی تاکید کرد.',
      'قیمت نفت برنت و تگزاس در معاملات دیروز کاهش یافت.',
      'وزارت جهاد کشاورزی از افزایش چشمگیر صادرات خبر داد.'
    ];

    const news = [];
    for (let i = 0; i < count; i++) {
      const randomCategory = this.categories[Math.floor(Math.random() * this.categories.length)];
      const randomAgency = this.agencies[Math.floor(Math.random() * this.agencies.length)];
      const timeAgo = Math.floor(Math.random() * 86400) + 3600; // 1-24 hours ago
      
      news.push({
        id: `mock-${i}`,
        title: mockTitles[i % mockTitles.length],
        content: mockContents[i % mockContents.length],
        image_url: featured || Math.random() > 0.3 ? 
          `https://picsum.photos/200/200?random=${i}` : null,
        pubDate: Math.floor(Date.now() / 1000) - timeAgo,
        link: '#',
        category: randomCategory,
        agency: randomAgency
      });
    }
    return news;
  }

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
            ${createFilterChips(this.categories, this.agencies, this.activeFilters)}
            
            <div class="news-list">
              ${this.renderNewsList()}
            </div>
          </section>
        </main>
      </div>
    `;
  }

  renderNewsList() {
    if (this.latestNews.length === 0) {
      return '<p class="loading">خبری یافت نشد</p>';
    }

    return this.latestNews.map((news, index) => {
      // Alternate between cards with and without images
      const hasImage = news.image_url && (index % 3 !== 2);
      return createNewsCard(news, hasImage);
    }).join('');
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

  setupSlider() {
    const sliderTrack = document.querySelector('.slider-track');
    const dots = document.querySelectorAll('.slider-dot');
    
    if (!sliderTrack || !dots.length) return;

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
        if (diff > 0) {
          this.nextSlide();
        } else {
          this.prevSlide();
        }
      }
      
      // Restart auto-slide
      this.sliderInterval = setInterval(() => {
        this.nextSlide();
      }, 5000);
    });
  }

  goToSlide(index) {
    this.currentSlide = index;
    const sliderTrack = document.querySelector('.slider-track');
    const dots = document.querySelectorAll('.slider-dot');
    
    if (sliderTrack) {
      const translateX = -index * (296 + 16); // card width + margin
      sliderTrack.style.transform = `translateX(${translateX}px)`;
    }
    
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  nextSlide() {
    const nextIndex = (this.currentSlide + 1) % this.featuredNews.length;
    this.goToSlide(nextIndex);
  }

  prevSlide() {
    const prevIndex = this.currentSlide === 0 ? this.featuredNews.length - 1 : this.currentSlide - 1;
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
        // Show filter panel
        console.log('Filter panel clicked');
        break;
    }
  }

  async loadLatestNews(filters = {}) {
    try {
      this.setLoading(true);
      const response = await getNews({ ...filters, limit: 10 });
      this.latestNews = response.data?.news || [];
      this.updateNewsList();
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      this.setLoading(false);
    }
  }

  updateNewsList() {
    const newsListContainer = document.querySelector('.news-list');
    if (newsListContainer) {
      newsListContainer.innerHTML = this.renderNewsList();
      this.setupNewsCardClicks();
    }
  }

  setupNewsCardClicks() {
    const newsCards = document.querySelectorAll('.news-card');
    
    newsCards.forEach(card => {
      card.addEventListener('click', (e) => {
        // Don't trigger if clicking on a link
        if (e.target.closest('a')) return;
        
        const newsId = card.dataset.newsId;
        const newsItem = this.latestNews.find(news => news.id === newsId) ||
                         this.featuredNews.find(news => news.id === newsId);
        
        if (newsItem) {
          this.openNewsDetail(newsItem);
        }
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

  destroy() {
    if (this.sliderInterval) {
      clearInterval(this.sliderInterval);
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
