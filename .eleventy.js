module.exports = function (eleventyConfig) {
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("CONTRIBUTING.md");
  eleventyConfig.ignores.add("CODE_OF_CONDUCT.md");
  eleventyConfig.ignores.add(".github/**");
  eleventyConfig.ignores.add("engineers/_template.md");

  eleventyConfig.addCollection("engineers", function (api) {
    return api
      .getFilteredByGlob("engineers/*.md")
      .filter((item) => item.page.fileSlug !== "_template");
  });

  eleventyConfig.addPassthroughCopy("site/assets");
  eleventyConfig.addPassthroughCopy({ "site/CNAME": "CNAME" });

  eleventyConfig.addFilter("uniqueValues", function (collection, field) {
    const seen = new Map();
    collection.forEach((item) => {
      const arr = item.data[field];
      if (Array.isArray(arr)) {
        arr.forEach((v) => {
          if (v) {
            const key = v.toLowerCase();
            if (!seen.has(key)) seen.set(key, v);
          }
        });
      }
    });
    return [...seen.values()].sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
  });

  eleventyConfig.addFilter("countValues", function (collection, field) {
    const counts = {};
    const canonical = {};
    collection.forEach((item) => {
      const arr = item.data[field];
      if (Array.isArray(arr)) {
        arr.forEach((v) => {
          if (v) {
            const key = v.toLowerCase();
            if (!canonical[key]) canonical[key] = v;
            counts[key] = (counts[key] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .reduce((obj, [key, count]) => { obj[canonical[key]] = count; return obj; }, {});
  });

  eleventyConfig.addFilter("lower", function (str) {
    return (str || "").toLowerCase();
  });

  eleventyConfig.addFilter("slugify", function (str) {
    return (str || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  });

  eleventyConfig.addFilter("socialUrl", function (social, value) {
    if (!value) return null;
    value = String(value);
    if (social.stripAt) value = value.replace(/^@/, "");
    return social.urlPrefix ? social.urlPrefix + value : value;
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "site/_includes",
      data: "site/_data",
    },
    markdownTemplateEngine: "njk",
  };
};
