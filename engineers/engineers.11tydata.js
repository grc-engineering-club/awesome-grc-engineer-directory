module.exports = {
  layout: "layouts/profile.njk",
  permalink: "engineers/{{ github }}/index.html",
  tags: "engineers",
  eleventyComputed: {
    eleventyExcludeFromCollections: data => data.page.fileSlug === "_template"
  }
};
