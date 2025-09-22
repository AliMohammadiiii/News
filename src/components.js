import { formatRelativeTime, getDefaultAgencyLogo } from './api.js';

/**
 * Create clock icon SVG
 * @returns {string}
 */
function createClockIcon() {
  return `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 18.9583C5.05834 18.9583 1.04167 14.9417 1.04167 9.99999C1.04167 5.05832 5.05834 1.04166 10 1.04166C14.9417 1.04166 18.9583 5.05832 18.9583 9.99999C18.9583 14.9417 14.9417 18.9583 10 18.9583ZM10 2.29166C5.75001 2.29166 2.29167 5.74999 2.29167 9.99999C2.29167 14.25 5.75001 17.7083 10 17.7083C14.25 17.7083 17.7083 14.25 17.7083 9.99999C17.7083 5.74999 14.25 2.29166 10 2.29166Z" fill="#91969F"/>
      <path d="M13.0914 13.275C12.983 13.275 12.8747 13.25 12.7747 13.1833L10.1914 11.6417C9.54971 11.2583 9.07471 10.4167 9.07471 9.675V6.25833C9.07471 5.91666 9.35804 5.63333 9.69971 5.63333C10.0414 5.63333 10.3247 5.91666 10.3247 6.25833V9.675C10.3247 9.975 10.5747 10.4167 10.833 10.5667L13.4164 12.1083C13.7164 12.2833 13.808 12.6667 13.633 12.9667C13.508 13.1667 13.2997 13.275 13.0914 13.275Z" fill="#91969F"/>
    </svg>
  `;
}

/**
 * Create external link icon SVG
 * @returns {string}
 */
function createExternalLinkIcon() {
  return `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 4.16667H15.8333V7.5" stroke="#1DBF98" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10.8333 9.16669L15.8333 4.16669" stroke="#1DBF98" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9.16667 3.33335H7.5C5.19882 3.33335 3.33333 5.19883 3.33333 7.50002V12.5C3.33333 14.8012 5.19882 16.6667 7.5 16.6667H12.5C14.8012 16.6667 16.6667 14.8012 16.6667 12.5V10.8334" stroke="#1DBF98" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
}

/**
 * Create setting icon SVG for filter
 * @returns {string}
 */
function createSettingIcon() {
  return `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.66666 6.04166H6.66666C7.00832 6.04166 7.29166 5.75832 7.29166 5.41666C7.29166 5.07499 7.00832 4.79166 6.66666 4.79166H1.66666C1.32499 4.79166 1.04166 5.07499 1.04166 5.41666C1.04166 5.75832 1.32499 6.04166 1.66666 6.04166Z" fill="#1DBF98"/>
      <path d="M15 6.04166H18.3333C18.675 6.04166 18.9583 5.75832 18.9583 5.41666C18.9583 5.07499 18.675 4.79166 18.3333 4.79166H15C14.6583 4.79166 14.375 5.07499 14.375 5.41666C14.375 5.75832 14.6583 6.04166 15 6.04166Z" fill="#1DBF98"/>
      <path d="M11.6667 8.95833C13.6167 8.95833 15.2083 7.36667 15.2083 5.41667C15.2083 3.46667 13.6167 1.875 11.6667 1.875C9.71668 1.875 8.12501 3.46667 8.12501 5.41667C8.12501 7.36667 9.71668 8.95833 11.6667 8.95833ZM11.6667 3.125C12.9333 3.125 13.9583 4.15 13.9583 5.41667C13.9583 6.68333 12.9333 7.70833 11.6667 7.70833C10.4 7.70833 9.37501 6.68333 9.37501 5.41667C9.37501 4.15 10.4 3.125 11.6667 3.125Z" fill="#1DBF98"/>
      <path d="M1.66667 15.2083H5C5.34167 15.2083 5.625 14.925 5.625 14.5833C5.625 14.2417 5.34167 13.9583 5 13.9583H1.66667C1.325 13.9583 1.04167 14.2417 1.04167 14.5833C1.04167 14.925 1.325 15.2083 1.66667 15.2083Z" fill="#1DBF98"/>
      <path d="M13.3333 15.2083H18.3333C18.675 15.2083 18.9583 14.925 18.9583 14.5833C18.9583 14.2417 18.675 13.9583 18.3333 13.9583H13.3333C12.9917 13.9583 12.7083 14.2417 12.7083 14.5833C12.7083 14.925 12.9917 15.2083 13.3333 15.2083Z" fill="#1DBF98"/>
      <path d="M8.33333 18.125C10.2833 18.125 11.875 16.5333 11.875 14.5833C11.875 12.6333 10.2833 11.0417 8.33333 11.0417C6.38333 11.0417 4.79167 12.6333 4.79167 14.5833C4.79167 16.5333 6.38333 18.125 8.33333 18.125ZM8.33333 12.2917C9.6 12.2917 10.625 13.3167 10.625 14.5833C10.625 15.85 9.6 16.875 8.33333 16.875C7.06667 16.875 6.04167 15.85 6.04167 14.5833C6.04167 13.3167 7.06667 12.2917 8.33333 12.2917Z" fill="#1DBF98"/>
    </svg>
  `;
}

/**
 * Create arrow right icon SVG
 * @returns {string}
 */
function createArrowRightIcon() {
  return `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.025 15.6833C11.8667 15.6833 11.7083 15.625 11.5833 15.5C11.3417 15.2583 11.3417 14.8583 11.5833 14.6167L16.2 10L11.5833 5.38333C11.3417 5.14167 11.3417 4.74167 11.5833 4.5C11.825 4.25833 12.225 4.25833 12.4667 4.5L17.525 9.55833C17.7667 9.8 17.7667 10.2 17.525 10.4417L12.4667 15.5C12.3417 15.625 12.1833 15.6833 12.025 15.6833Z" fill="#4F545E"/>
      <path d="M16.9417 10.625H2.91666C2.57499 10.625 2.29166 10.3417 2.29166 10C2.29166 9.65833 2.57499 9.375 2.91666 9.375H16.9417C17.2833 9.375 17.5667 9.65833 17.5667 10C17.5667 10.3417 17.2833 10.625 16.9417 10.625Z" fill="#4F545E"/>
    </svg>
  `;
}

/**
 * Create headphones icon SVG
 * @returns {string}
 */
function createHeadphonesIcon() {
  return `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M15.8333 14.1667H15C14.54 14.1667 14.1667 13.7933 14.1667 13.3333V9.16667C14.1667 8.70667 14.54 8.33334 15 8.33334H15.8333C16.7542 8.33334 17.5 9.07917 17.5 10V12.5C17.5 13.4208 16.7542 14.1667 15.8333 14.1667Z" stroke="#4F545E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M5 14.1667H4.16667C3.24583 14.1667 2.5 13.4208 2.5 12.5V10C2.5 9.07917 3.24583 8.33334 4.16667 8.33334H5C5.46 8.33334 5.83333 8.70667 5.83333 9.16667V13.3333C5.83333 13.7933 5.46 14.1667 5 14.1667Z" stroke="#4F545E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M15.4167 8.33333V7.91667C15.4167 4.925 12.9917 2.5 10 2.5V2.5C7.00833 2.5 4.58333 4.925 4.58333 7.91667V8.33333" stroke="#4F545E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M10.5208 17.7083H9.47917C8.90417 17.7083 8.4375 17.2417 8.4375 16.6667V16.6667C8.4375 16.0917 8.90417 15.625 9.47917 15.625H10.5208C11.0958 15.625 11.5625 16.0917 11.5625 16.6667V16.6667C11.5625 17.2417 11.0958 17.7083 10.5208 17.7083Z" stroke="#4F545E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M11.5625 16.6667H13.3333C14.2542 16.6667 15 15.9208 15 15V14.1667" stroke="#4F545E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
}

/**
 * Create a news card with image
 * @param {object} newsItem - News data
 * @param {boolean} hasImage - Whether to show image
 * @returns {string}
 */
export function createNewsCard(newsItem, hasImage = true) {
  const {
    id,
    title,
    content,
    image_url,
    pubDate,
    link,
    category,
    agency
  } = newsItem;

  const relativeTime = formatRelativeTime(pubDate);
  const agencyImageUrl = agency.image_url || getDefaultAgencyLogo(agency.name);
  const agencyNameElement = agency.website
    ? `<a href="${agency.website}" class="news-card-agency-name" target="_blank" rel="noopener noreferrer">${agency.name}</a>`
    : `<span class="news-card-agency-name">${agency.name}</span>`;
  const shouldShowImage = hasImage && image_url;

  return `
    <article class="news-card" data-news-id="${id}">
      <header class="news-card-header">
        <div class="news-card-time">
          ${createClockIcon()}
          <span>${relativeTime}</span>
        </div>
        <div class="news-card-agency">
          ${agencyNameElement}
          <img src="${agencyImageUrl}" alt="${agency.name}" loading="lazy" />
        </div>
      </header>

      <div class="news-card-content">
        <h2 class="news-card-title">${title}</h2>

        <div class="news-card-body">
          <div class="news-card-text">
            ${content}
          </div>
          ${shouldShowImage ? `
            <img src="${image_url}" alt="${title}" class="news-card-image" loading="lazy" />
          ` : ''}
        </div>
      </div>

      <footer class="news-card-footer">
        <a href="${link}" class="view-button" target="_blank" rel="noopener noreferrer">
          ${createExternalLinkIcon()}
          <span>مشاهده</span>
        </a>
        <span class="category-tag">${category.name}</span>
      </footer>
    </article>
  `;
}

/**
 * Create a featured news card for the slider
 * @param {object} newsItem - News data
 * @returns {string}
 */
export function createFeaturedCard(newsItem) {
  const {
    id,
    title,
    image_url,
    agency
  } = newsItem;

  const agencyImageUrl = agency.image_url || getDefaultAgencyLogo(agency.name);
  const fallbackImage = 'https://via.placeholder.com/314x314/1DBF98/FFFFFF?text=خبر';
  const agencyNameElement = agency.website
    ? `<a href="${agency.website}" class="featured-card-agency-name" target="_blank" rel="noopener noreferrer">${agency.name}</a>`
    : `<span class="featured-card-agency-name">${agency.name}</span>`;

  return `
    <div class="featured-card" data-news-id="${id}">
      <img src="${image_url || fallbackImage}" alt="${title}" loading="lazy" />
      <div class="featured-card-overlay">
        <div class="featured-card-agency">
          ${agencyNameElement}
          <img src="${agencyImageUrl}" alt="${agency.name}" loading="lazy" />
        </div>
        <h3 class="featured-card-title">${title}</h3>
      </div>
    </div>
  `;
}

/**
 * Create slider component with news items
 * @param {Array} newsItems - Array of news items
 * @returns {string}
 */
export function createNewsSlider(newsItems) {
  const slides = newsItems.map(item => createFeaturedCard(item)).join('');
  const dots = newsItems.map((_, index) => 
    `<div class="slider-dot ${index === 0 ? 'active' : ''}" data-slide="${index}"></div>`
  ).join('');

  return `
    <div class="news-slider">
      <div class="slider-container">
        <div class="slider-track" style="transform: translateX(0)">
          ${slides}
        </div>
      </div>
      <div class="slider-dots">
        ${dots}
      </div>
    </div>
  `;
}

/**
 * Create filter chips
 * @param {Array} categories - Categories array
 * @param {Array} agencies - Agencies array
 * @param {object} activeFilters - Current active filters
 * @returns {string}
 */
export function createFilterChips(categories, agencies, activeFilters = {}) {
  return `
    <div class="filter-chips">
      <button class="filter-chip ${activeFilters.category_id ? '' : 'active'}" data-filter="all">
        همه
      </button>
      <button class="filter-chip" data-filter="category">
        دسته بندی
      </button>
      <button class="filter-chip" data-filter="date">
        تاریخ خبر
      </button>
      <button class="filter-chip active" data-filter="filter">
        فیلتر
        ${createSettingIcon()}
      </button>
    </div>
  `;
}

/**
 * Create top bar component
 * @returns {string}
 */
export function createTopBar() {
  return `
    <header class="top-bar">
      <div class="top-bar-icons">
        <button class="icon-button">
          ${createHeadphonesIcon()}
        </button>
        <button class="icon-button">
        </button>
      </div>
      <h1 class="top-bar-title">خلاصه اخبار</h1>
      <div class="top-bar-icons">
        <button class="icon-button">
        </button>
        <button class="icon-button">
          ${createArrowRightIcon()}
        </button>
      </div>
    </header>
  `;
}

/**
 * Create loading spinner
 * @returns {string}
 */
export function createLoadingSpinner() {
  return `
    <div class="loading">
      <p>در حال بارگذاری...</p>
    </div>
  `;
}

/**
 * Create error message
 * @param {string} message - Error message
 * @returns {string}
 */
export function createErrorMessage(message) {
  return `
    <div class="error">
      <p>خطا در بارگذاری: ${message}</p>
    </div>
  `;
}

/**
 * Create close icon SVG
 * @returns {string}
 */
function createCloseIcon() {
  return `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.9787 14.2706C14.2293 14.02 14.2293 13.6045 13.9787 13.354L6.64599 6.02123C6.39545 5.77069 5.97993 5.77069 5.7294 6.02123C5.47886 6.27176 5.47886 6.68729 5.7294 6.93782L13.0621 14.2706C13.3127 14.5211 13.7282 14.5211 13.9787 14.2706Z" fill="#242933"/>
      <path d="M6.6452 14.2706L13.9779 6.93782C14.2285 6.68729 14.2285 6.27176 13.9779 6.02123C13.7274 5.77069 13.3119 5.77069 13.0613 6.02123L5.72861 13.354C5.47808 13.6045 5.47808 14.02 5.72861 14.2706C5.97915 14.5211 6.39467 14.5211 6.6452 14.2706Z" fill="#242933"/>
    </svg>
  `;
}

/**
 * Create calendar icon SVG
 * @returns {string}
 */
function createCalendarIcon() {
  return `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.6803 4.79166C6.33863 4.79166 6.0553 4.50832 6.0553 4.16666V1.66666C6.0553 1.32499 6.33863 1.04166 6.6803 1.04166C7.02196 1.04166 7.3053 1.32499 7.3053 1.66666V4.16666C7.3053 4.50832 7.02196 4.79166 6.6803 4.79166Z" fill="#4F545E"/>
      <path d="M13.347 4.79166C13.0054 4.79166 12.722 4.50832 12.722 4.16666V1.66666C12.722 1.32499 13.0054 1.04166 13.347 1.04166C13.6887 1.04166 13.972 1.32499 13.972 1.66666V4.16666C13.972 4.50832 13.6887 4.79166 13.347 4.79166Z" fill="#4F545E"/>
      <path d="M17.097 8.19995H2.9303C2.58863 8.19995 2.3053 7.91662 2.3053 7.57495C2.3053 7.23328 2.58863 6.94995 2.9303 6.94995H17.097C17.4386 6.94995 17.722 7.23328 17.722 7.57495C17.722 7.91662 17.4386 8.19995 17.097 8.19995Z" fill="#4F545E"/>
      <path d="M13.347 18.9584H6.68034C3.63867 18.9584 1.88867 17.2084 1.88867 14.1667V7.08335C1.88867 4.04169 3.63867 2.29169 6.68034 2.29169H13.347C16.3887 2.29169 18.1387 4.04169 18.1387 7.08335V14.1667C18.1387 17.2084 16.3887 18.9584 13.347 18.9584ZM6.68034 3.54169C4.29701 3.54169 3.13867 4.70002 3.13867 7.08335V14.1667C3.13867 16.55 4.29701 17.7084 6.68034 17.7084H13.347C15.7303 17.7084 16.8887 16.55 16.8887 14.1667V7.08335C16.8887 4.70002 15.7303 3.54169 13.347 3.54169H6.68034Z" fill="#4F545E"/>
    </svg>
  `;
}

/**
 * Create dropdown arrow icon SVG
 * @returns {string}
 */
function createDropdownArrowIcon() {
  return `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.6 7.45833L11.1667 12.8917C10.525 13.5333 9.47502 13.5333 8.83336 12.8917L3.40002 7.45833" stroke="#4F545E" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
}

/**
 * Create check icon SVG
 * @returns {string}
 */
function createCheckIcon() {
  return `
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 3L4.5 8.5L2 6" stroke="white" stroke-width="1.6666" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
}

/**
 * Create small close icon SVG for tags
 * @returns {string}
 */
function createSmallCloseIcon() {
  return `
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 3L3 9M3 3L9 9" stroke="#4F545E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
}

/**
 * Create agency checkbox item
 * @param {object} agency - Agency data
 * @param {boolean} isChecked - Whether the checkbox is checked
 * @param {boolean} isHovered - Whether the item is hovered
 * @returns {string}
 */
function createAgencyCheckboxItem(agency, isChecked = false, isHovered = false) {
  const hoverClass = isHovered ? 'filter-dropdown-item-hover' : '';
  const checkboxClass = isChecked ? 'filter-checkbox-checked' : 'filter-checkbox-unchecked';

  return `
    <div class="filter-dropdown-item ${hoverClass}" data-agency-id="${agency.id}">
      <div class="filter-dropdown-item-content">
        <span class="filter-dropdown-item-text">${agency.name}</span>
        <div class="filter-checkbox ${checkboxClass}">
          ${isChecked ? `<div class="filter-checkbox-bg">${createCheckIcon()}</div>` : ''}
        </div>
      </div>
    </div>
  `;
}

/**
 * Create filter category chip
 * @param {object} category - Category data
 * @param {boolean} isSelected - Whether the chip is selected
 * @returns {string}
 */
function createFilterCategoryChip(category, isSelected = false) {
  const selectedClass = isSelected ? 'filter-category-chip-selected' : '';
  const closeIcon = isSelected ? createSmallCloseIcon() : '';

  return `
    <button class="filter-category-chip ${selectedClass}" data-category-id="${category.id}">
      <span>${category.name}</span>
      ${isSelected ? `<span class="filter-chip-close">${closeIcon}</span>` : ''}
    </button>
  `;
}

/**
 * Create selected filter tag
 * @param {object} item - Selected item data
 * @param {string} type - Type of filter (agency, category)
 * @returns {string}
 */
function createSelectedFilterTag(item, type) {
  return `
    <div class="selected-filter-tag" data-${type}-id="${item.id}">
      <span class="selected-filter-tag-close">${createSmallCloseIcon()}</span>
      <span class="selected-filter-tag-text">${item.name}</span>
    </div>
  `;
}

/**
 * Create filter modal
 * @param {Array} agencies - Array of agencies
 * @param {Array} categories - Array of categories
 * @param {object} selectedFilters - Currently selected filters
 * @returns {string}
 */
export function createFilterModal(agencies = [], categories = [], selectedFilters = {}) {
  const selectedAgencies = selectedFilters.agencies || [];
  const selectedCategories = selectedFilters.categories || [];
  const startDate = selectedFilters.startDate || '';
  const endDate = selectedFilters.endDate || '';

  const agencyCheckboxes = agencies.map(agency =>
    createAgencyCheckboxItem(agency, selectedAgencies.some(sa => sa.id === agency.id))
  ).join('');

  const categoryChips = categories.map(category =>
    createFilterCategoryChip(category, selectedCategories.some(sc => sc.id === category.id))
  ).join('');

  const selectedAgencyTags = selectedAgencies.map(agency =>
    createSelectedFilterTag(agency, 'agency')
  ).join('');

  return `
    <div class="filter-modal-overlay">
      <div class="filter-modal">
        <div class="filter-modal-content">
          <!-- Header -->
          <div class="filter-modal-header">
            <button class="filter-modal-close" type="button">
              ${createCloseIcon()}
            </button>
            <h2 class="filter-modal-title">فیلتر مورد نظرت رو اعمال کن</h2>
          </div>

          <!-- News Source Section -->
          <div class="filter-section">
            <label class="filter-section-label">منبع خبری</label>
            <div class="filter-dropdown-wrapper">
              <button class="filter-dropdown-toggle" type="button">
                ${createDropdownArrowIcon()}
                <span class="filter-dropdown-placeholder">منبع خبری رو انتخاب کن</span>
              </button>
              <div class="filter-dropdown-content">
                <div class="filter-dropdown-scroll">
                  <div class="filter-dropdown-scrollbar">
                    <div class="filter-dropdown-scrollbar-track"></div>
                  </div>
                  <div class="filter-dropdown-list">
                    ${agencyCheckboxes}
                  </div>
                </div>
              </div>

              <!-- Selected Agencies Tags -->
              ${selectedAgencies.length > 0 ? `
                <div class="filter-selected-container">
                  ${selectedAgencyTags}
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Category Section -->
          <div class="filter-section">
            <label class="filter-section-label">دسته بندی</label>
            <div class="filter-category-chips">
              ${categoryChips}
            </div>
          </div>

          <!-- Date Section -->
          <div class="filter-section">
            <label class="filter-section-label">تاریخ خبر</label>
            <div class="filter-date-inputs">
              <div class="filter-date-input">
                <input type="text" class="filter-date-field" placeholder="۱۴۰۴/۰۵/۳۰" value="${startDate}" data-date-type="start">
                <span class="filter-date-icon">${createCalendarIcon()}</span>
              </div>
              <div class="filter-date-input">
                <input type="text" class="filter-date-field" placeholder="۱۴۰۴/۰۵/۰۱" value="${endDate}" data-date-type="end">
                <span class="filter-date-icon">${createCalendarIcon()}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="filter-modal-footer">
          <button class="filter-apply-btn" type="button">فیلتر</button>
          <button class="filter-clear-btn" type="button">حذف فیلتر</button>
        </div>
      </div>
    </div>
  `;
}
