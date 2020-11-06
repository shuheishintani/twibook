const path = require('path');

module.exports = {
  distDir: '../.next',
  webpack: config => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
  images: {
    domains: ['thumbnail.image.rakuten.co.jp'],
  },
};
