const { Core } = require('@adobe/aio-sdk');

const SUGGESTIONS = {
  landing: {
    sections: ['navigation', 'hero', 'teaser', 'teaser', 'teaser', 'cta', 'footer'],
    description: 'Landing page with hero, teasers, and CTA',
  },
  product: {
    sections: ['navigation', 'hero', 'product', 'tabs', 'quote', 'cta', 'footer'],
    description: 'Product detail page with features and testimonials',
  },
  blog: {
    sections: ['navigation', 'hero', 'teaser', 'accordion', 'social', 'footer'],
    description: 'Blog article with content sections',
  },
};

async function main(params) {
  const logger = Core.Logger('suggest', { level: params.LOG_LEVEL || 'info' });

  const input = (params.prompt || '').toLowerCase();
  let match = 'landing';

  if (input.includes('product') || input.includes('detail')) match = 'product';
  else if (input.includes('blog') || input.includes('article')) match = 'blog';

  logger.info(`Suggested layout "${match}" for input: "${params.prompt}"`);

  return {
    statusCode: 200,
    body: {
      suggestion: SUGGESTIONS[match],
      confidence: match === 'landing' ? 70 : 90,
    },
  };
}

exports.main = main;
