export {
  downloadPhoto,
  type FetchBlogPhotosResult,
  type FetchPhotoResult,
  fetchBlogPhoto,
  fetchBlogPhotosForEvaluation,
  formatPhotoCredit,
  getCuratedPhotos,
  getPhoto,
  type PexelsPhoto,
  type PexelsSearchResponse,
  type SearchOptions,
  searchPhotos,
  selectPhotoFromResults,
} from './client';

export {
  CATEGORY_SEARCH_TERMS,
  FALLBACK_SEARCH_TERMS,
  generateAltText,
  getCombinedSearchTerms,
  getSearchTermsForCategory,
  getSearchTermsForTopic,
  TOPIC_SEARCH_TERMS,
} from './search-terms';
