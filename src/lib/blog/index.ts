/**
 * Blog module index.
 * Re-exports author profiles, categories, post-category mapping, and provides helpers
 * for enriching blog posts with structured author/category data.
 */

export { AUTHORS, getAuthorByName, getAuthorById, getAllAuthors, generateAuthorPersonSchema } from './authors';
export type { AuthorProfile } from './authors';

export { BLOG_CATEGORIES, getCategoryBySlug, getAllCategories, inferCategory } from './categories';
export type { BlogCategory, BlogCategorySlug } from './categories';

export { POST_CATEGORY_MAP, getPostCategory, getPostsByCategory, hasExplicitCategory } from './post-categories';
