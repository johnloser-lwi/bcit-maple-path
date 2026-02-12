/**
 * Article Page - Dynamic Content Loading
 */

document.addEventListener('DOMContentLoaded', async function() {
  // Get article ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = parseInt(urlParams.get('id'));

  if (!articleId) {
    window.location.href = 'blog.html';
    return;
  }

  try {
    // Load articles data
    const response = await fetch('data/articles.json');
    if (!response.ok) {
      throw new Error('Failed to load article data');
    }

    const articles = await response.json();
    const article = articles.find(a => a.id === articleId);

    if (!article) {
      // Article not found, redirect to blog
      window.location.href = 'blog.html';
      return;
    }

    // Populate article content
    populateArticle(article);

    // Load and display similar articles (other articles excluding current one)
    loadSimilarArticles(articles, articleId);

  } catch (error) {
    console.error('Error loading article:', error);
    document.querySelector('main').innerHTML = '<p class="text-light-grey p-10 text-center">Error loading article. Please try again later.</p>';
  }
});

/**
 * Populate article content into the page
 */
function populateArticle(article) {
  // Update page title
  document.title = `${article.title} - MaplePath`;

  // Format date
  const dateObj = new Date(article.date);
  const formattedDate = `${article.location}, ${dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}`;

  // Populate all fields
  document.getElementById('article-title').textContent = article.title;
  document.getElementById('article-hero').src = article.image;
  document.getElementById('article-hero').alt = article.title;

  // Stats
  document.getElementById('article-likes').textContent = article.likes || '0';
  document.getElementById('article-views').textContent = article.views || '0';
  document.getElementById('article-shares').textContent = article.shares || '0';

  // Metadata
  document.getElementById('article-date').textContent = formattedDate;
  document.getElementById('article-reading').textContent = article.readingTime || '3 min';
  document.getElementById('article-category').textContent = article.category || article.type;
  document.getElementById('article-source').textContent = getSourceFullName(article.source);

  // Content
  if (article.fullContent) {
    document.getElementById('article-intro').textContent = article.fullContent.intro;

    // Populate body paragraphs
    const bodyContainer = document.getElementById('article-body');
    bodyContainer.innerHTML = '';

    article.fullContent.body.forEach(paragraph => {
      const p = document.createElement('p');
      p.textContent = paragraph;
      bodyContainer.appendChild(p);
    });
  } else {
    // Fallback to description if no full content
    document.getElementById('article-intro').textContent = article.description;
    document.getElementById('article-body').innerHTML = '<p>Full article content coming soon.</p>';
  }
}

/**
 * Get full source name
 */
function getSourceFullName(source) {
  const sourceMap = {
    'IRCC': 'Immigration, Refugees and Citizenship Canada',
    'CICC': 'College of Immigration and Citizenship Consultants',
    'Government': 'Government of Canada',
    'government': 'Government of Canada',
    'ircc': 'Immigration, Refugees and Citizenship Canada',
    'cicc': 'College of Immigration and Citizenship Consultants'
  };

  return sourceMap[source] || source;
}

/**
 * Load similar articles
 */
function loadSimilarArticles(articles, currentId) {
  const similarSection = document.querySelector('section.mt-12 .grid');
  if (!similarSection) return;

  // Get other articles (excluding current one)
  const otherArticles = articles.filter(a => a.id !== currentId).slice(0, 3);

  similarSection.innerHTML = '';

  otherArticles.forEach(article => {
    const articleCard = createSimilarArticleCard(article);
    similarSection.appendChild(articleCard);
  });
}

/**
 * Create similar article card
 */
function createSimilarArticleCard(article) {
  const card = document.createElement('article');
  card.className = 'flex flex-col gap-2';

  card.innerHTML = `
    <img class="w-full h-[240px] object-cover rounded-2xl bg-black/30 mb-2"
         src="${article.image}"
         alt="${article.title}" />

    <h3 class="text-xl font-semibold">${article.title}</h3>

    <p class="text-sm opacity-70 mb-2">${article.category || article.type}</p>

    <div class="flex justify-end">
      <a href="article.html?id=${article.id}"
         class="inline-flex items-center gap-2 bg-deep-black px-6 py-3 rounded-lg text-sm font-medium text-white hover:opacity-80 transition">
        Read More <span class="text-accent">↗</span>
      </a>
    </div>
  `;

  return card;
}
