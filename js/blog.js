/**
 * Blog Page - Search and Filter Functionality
 */

document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const searchInput = document.getElementById('search-input');
  const articlesList = document.getElementById('articles-list');
  const noResults = document.getElementById('no-results');
  const suggestionsMessage = document.getElementById('suggestions-message');
  const applyFilterBtn = document.getElementById('apply-filters');
  const filterToggles = document.querySelectorAll('.filter-toggle');
  const timeChips = document.querySelectorAll('.time-chip');

  // State
  let articlesData = [];
  let selectedTimeFilter = 365; // Default: Past 1 Year
  let searchQuery = '';

  // Initialize
  init();

  async function init() {
    await loadArticles();
    renderArticles();
    setupFilterToggles();
    setupTimeChips();
    setupSearch();
    setupApplyFilter();
  }

  /**
   * Load articles from JSON file
   */
  async function loadArticles() {
    try {
      const response = await fetch('data/articles.json');
      if (!response.ok) {
        throw new Error('Failed to load articles');
      }
      articlesData = await response.json();
    } catch (error) {
      console.error('Error loading articles:', error);
      articlesList.innerHTML = '<p class="text-light-grey p-5">Error loading articles. Please try again later.</p>';
    }
  }

  /**
   * Render all articles to the page
   */
  function renderArticles() {
    articlesList.innerHTML = '';

    if (articlesData.length === 0) {
      noResults.classList.remove('hidden');
      return;
    }

    articlesData.forEach(article => {
      const articleCard = createArticleCard(article);
      articlesList.appendChild(articleCard);
    });

    noResults.classList.add('hidden');
  }

  /**
   * Create an article card element
   */
  function createArticleCard(article) {
    const card = document.createElement('a');
    card.href = `article.html?id=${article.id}`;
    card.className = 'article-card';
    card.dataset.type = article.type;
    card.dataset.source = article.source;
    card.dataset.region = article.region;
    card.dataset.date = article.date;

    // Format date for display
    const dateObj = new Date(article.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    card.innerHTML = `
      <div class="article-image-wrapper">
        <div class="article-image" style="background-image: url('${article.image}')">
          <div class="article-image-overlay">
            <img src="assets/Canada.png" alt="Canada" class="article-badge" />
            <span class="article-location-date">${article.location}, ${formattedDate}</span>
          </div>
        </div>
      </div>
      <div class="article-content">
        <h3 class="article-title">${article.title}</h3>
        <p class="article-description">${article.description}</p>
        <button class="read-more-btn">Read More <span class="arrow">↗</span></button>
      </div>
    `;

    return card;
  }

  /**
   * Setup collapsible filter sections
   */
  function setupFilterToggles() {
    filterToggles.forEach(toggle => {
      toggle.addEventListener('click', function() {
        const filterType = this.dataset.filter;
        const optionsEl = document.getElementById(`filter-${filterType}`);
        const chevron = this.querySelector('.chevron');

        if (optionsEl) {
          optionsEl.classList.toggle('hidden');
          chevron.classList.toggle('rotated');
        }
      });
    });
  }

  /**
   * Setup time filter chips
   */
  function setupTimeChips() {
    timeChips.forEach(chip => {
      chip.addEventListener('click', function() {
        // Remove selected from all chips
        timeChips.forEach(c => c.classList.remove('selected'));
        // Add selected to clicked chip
        this.classList.add('selected');
        // Update state
        selectedTimeFilter = parseInt(this.dataset.days);
      });
    });
  }

  /**
   * Setup search functionality with real-time filtering
   */
  function setupSearch() {
    searchInput.addEventListener('input', function() {
      searchQuery = this.value.toLowerCase().trim();
      applyFilters();
    });
  }

  /**
   * Setup Apply Filter button
   */
  function setupApplyFilter() {
    applyFilterBtn.addEventListener('click', function() {
      applyFilters();
    });
  }

  /**
   * Apply all filters to articles
   */
  function applyFilters() {
    const articles = articlesList.querySelectorAll('.article-card');
    let exactMatchCount = 0;
    let suggestionMatchCount = 0;

    // Get selected checkbox filters
    const selectedTypes = getSelectedCheckboxValues('filter-type');
    const selectedSources = getSelectedCheckboxValues('filter-source');
    const selectedRegions = getSelectedCheckboxValues('filter-region');

    // Calculate cutoff date for time filter
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - selectedTimeFilter);

    // Check if any filters are active
    const hasActiveFilters = searchQuery || selectedTypes.length > 0 ||
                             selectedSources.length > 0 || selectedRegions.length > 0;

    // First pass: Check for exact matches
    articles.forEach(article => {
      const matchResult = checkArticleMatch(article, searchQuery, selectedTypes,
                                           selectedSources, selectedRegions, cutoffDate);

      if (matchResult.exactMatch) {
        article.style.display = 'block';
        article.classList.remove('suggestion-article');
        exactMatchCount++;
      } else {
        article.style.display = 'none';
        article.classList.remove('suggestion-article');
      }
    });

    // Second pass: If no exact matches and filters are active, show suggestions (max 3)
    if (exactMatchCount === 0 && hasActiveFilters) {
      const MAX_SUGGESTIONS = 3;

      // Try to find partial matches first
      articles.forEach(article => {
        const matchResult = checkArticleMatch(article, searchQuery, selectedTypes,
                                             selectedSources, selectedRegions, cutoffDate);

        if (matchResult.partialMatch && suggestionMatchCount < MAX_SUGGESTIONS) {
          article.style.display = 'block';
          article.classList.add('suggestion-article');
          suggestionMatchCount++;
        }
      });

      // If still no suggestions, show the most recent articles within time filter
      if (suggestionMatchCount === 0) {
        articles.forEach(article => {
          const articleDateStr = article.dataset.date;
          const articleDate = new Date(articleDateStr);

          if (articleDate >= cutoffDate && suggestionMatchCount < MAX_SUGGESTIONS) {
            article.style.display = 'block';
            article.classList.add('suggestion-article');
            suggestionMatchCount++;
          }
        });
      }
    }

    // Update UI messages
    if (exactMatchCount > 0) {
      // Exact matches found
      noResults.classList.add('hidden');
      suggestionsMessage.classList.add('hidden');
    } else if (suggestionMatchCount > 0) {
      // No exact matches, but suggestions found
      noResults.classList.add('hidden');
      suggestionsMessage.classList.remove('hidden');
    } else {
      // No matches or suggestions
      noResults.classList.remove('hidden');
      suggestionsMessage.classList.add('hidden');
    }
  }

  /**
   * Check if an article matches the search criteria
   * Returns an object with exactMatch and partialMatch flags
   */
  function checkArticleMatch(article, searchQuery, selectedTypes, selectedSources, selectedRegions, cutoffDate) {
    const title = article.querySelector('.article-title').textContent.toLowerCase();
    const description = article.querySelector('.article-description').textContent.toLowerCase();
    const articleType = article.dataset.type;
    const articleSource = article.dataset.source;
    const articleRegion = article.dataset.region;
    const articleDateStr = article.dataset.date;
    const articleDate = new Date(articleDateStr);

    // Check time filter (always apply, even for suggestions)
    const passesTimeFilter = articleDate >= cutoffDate;

    if (!passesTimeFilter) {
      return { exactMatch: false, partialMatch: false };
    }

    // Check search query match
    const matchesSearch = !searchQuery ||
                         title.includes(searchQuery) ||
                         description.includes(searchQuery);

    // Check filter matches
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(articleType);
    const matchesSource = selectedSources.length === 0 || selectedSources.includes(articleSource);
    const matchesRegion = selectedRegions.length === 0 || selectedRegions.includes(articleRegion);

    // Exact match: passes all criteria
    const exactMatch = matchesSearch && matchesType && matchesSource && matchesRegion;

    // Partial match: matches at least the search query OR one of the filters
    // (for suggestions when there are no exact matches)
    const hasAnyFilter = selectedTypes.length > 0 || selectedSources.length > 0 || selectedRegions.length > 0;
    const partialMatch = (searchQuery && matchesSearch) ||
                        (hasAnyFilter && (matchesType || matchesSource || matchesRegion));

    return { exactMatch, partialMatch };
  }

  /**
   * Get selected checkbox values for a filter section
   */
  function getSelectedCheckboxValues(filterId) {
    const filterEl = document.getElementById(filterId);
    if (!filterEl) return [];

    const checkboxes = filterEl.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
  }
});
