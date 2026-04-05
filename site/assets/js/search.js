(function () {
  var searchInput = document.getElementById("search-input");
  var cards = Array.from(document.querySelectorAll(".card"));
  var chips = Array.from(document.querySelectorAll(".chip"));
  var clearBtn = document.getElementById("clear-filters");
  var countEl = document.getElementById("results-count");
  var noResults = document.getElementById("no-results");
  var summaryEl = document.getElementById("active-filters-summary");
  var pillsEl = document.getElementById("active-filter-pills");

  var FILTER_KEYS = ["specializations", "frameworks", "languages", "available", "certifications"];
  var activeFilters = {};
  FILTER_KEYS.forEach(function (k) { activeFilters[k] = []; });

  /* --- Chip lookup cache: O(1) instead of querySelector per chip --- */
  var chipCache = {};
  chips.forEach(function (chip) {
    var group = chip.closest("[data-filter]");
    if (!group) return;
    var key = group.dataset.filter + ":" + chip.dataset.value;
    chipCache[key] = chip;
  });

  function getChip(filterKey, value) {
    return chipCache[filterKey + ":" + value] || null;
  }

  /* --- Badge element cache --- */
  var badgeCache = {};
  FILTER_KEYS.forEach(function (key) {
    var group = document.querySelector('.filter-group[data-group="' + key + '"]');
    if (group) badgeCache[key] = group.querySelector(".count-badge");
  });

  /* --- Pre-parse card data (avoids re-splitting on every filter) --- */
  var cardData = cards.map(function (card) {
    var parsed = {};
    FILTER_KEYS.forEach(function (k) {
      var attr = k === "available" ? "available" : k;
      parsed[k] = (card.dataset[attr] || "").split(",").filter(Boolean);
    });
    parsed.name = card.dataset.name || "";
    parsed.allText = [parsed.name].concat(FILTER_KEYS.map(function (k) { return parsed[k].join(" "); })).join(" ");
    return parsed;
  });

  /* --- Debounce helper --- */
  function debounce(fn, delay) {
    var timer;
    return function() {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }

  /* --- Phased filter transitions --- */
  var FADE_MS = 250;
  var pendingTimers = new Map();

  function hideCard(card) {
    if (card.classList.contains("hidden")) return;
    if (pendingTimers.has(card)) {
      clearTimeout(pendingTimers.get(card));
      pendingTimers.delete(card);
    }
    card.classList.add("fading");
    var timer = setTimeout(function () {
      card.classList.add("hidden");
      pendingTimers.delete(card);
    }, FADE_MS);
    pendingTimers.set(card, timer);
  }

  function showCard(card) {
    if (!card.classList.contains("hidden") && !card.classList.contains("fading")) return;
    if (pendingTimers.has(card)) {
      clearTimeout(pendingTimers.get(card));
      pendingTimers.delete(card);
    }
    card.classList.remove("hidden", "fading");
  }

  var _skipUrlSync = false;

  function updateCards() {
    var query = (searchInput.value || "").toLowerCase().trim();
    var visible = 0;

    cards.forEach(function (card, i) {
      var data = cardData[i];
      var show = true;

      if (query && data.allText.indexOf(query) === -1) show = false;

      for (var fi = 0; show && fi < FILTER_KEYS.length; fi++) {
        var key = FILTER_KEYS[fi];
        if (activeFilters[key].length > 0) {
          var vals = data[key];
          var has = activeFilters[key].some(function (v) { return vals.indexOf(v) !== -1; });
          if (!has) show = false;
        }
      }

      if (show) { showCard(card); visible++; }
      else { hideCard(card); }
    });

    if (countEl) countEl.textContent = visible;
    if (noResults) noResults.style.display = visible === 0 ? "" : "none";

    if (!_skipUrlSync) syncFiltersToUrl();
    updateSummary();
    updateBadgeCounts();
  }

  /* --- Collapsible filter groups --- */
  var groupHeaders = Array.from(document.querySelectorAll(".filter-group-header"));
  groupHeaders.forEach(function (header) {
    header.addEventListener("click", function () {
      var group = header.closest(".filter-group");
      var isOpen = group.classList.toggle("open");
      header.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });

  /* --- Active filter summary (event delegation + fragment batching) --- */
  function updateSummary() {
    if (!summaryEl || !pillsEl) return;
    var pills = [];
    FILTER_KEYS.forEach(function (key) {
      activeFilters[key].forEach(function (val) {
        var chip = getChip(key, val);
        var label = chip ? chip.textContent : val;
        pills.push({ key: key, value: val, label: label });
      });
    });

    var hasActive = pills.length > 0;
    summaryEl.style.display = hasActive ? "" : "none";

    var fragment = document.createDocumentFragment();
    pills.forEach(function (p) {
      var btn = document.createElement("button");
      btn.className = "active-filter-pill";
      btn.dataset.filterKey = p.key;
      btn.dataset.filterValue = p.value;
      btn.innerHTML = p.label + ' <span class="pill-x">\u00d7</span>';
      fragment.appendChild(btn);
    });
    pillsEl.innerHTML = "";
    pillsEl.appendChild(fragment);
  }

  /* Event delegation for pill clicks (single listener instead of per-pill) */
  if (pillsEl) {
    pillsEl.addEventListener("click", function (e) {
      var pill = e.target.closest(".active-filter-pill");
      if (!pill) return;
      var key = pill.dataset.filterKey;
      var value = pill.dataset.filterValue;
      var chip = getChip(key, value);
      if (chip) {
        chip.classList.remove("active");
        chip.setAttribute("aria-pressed", "false");
      }
      var idx = activeFilters[key].indexOf(value);
      if (idx !== -1) activeFilters[key].splice(idx, 1);
      updateCards();
    });
  }

  /* --- Badge counts on group headers --- */
  function updateBadgeCounts() {
    FILTER_KEYS.forEach(function (key) {
      var badge = badgeCache[key];
      if (!badge) return;
      var count = activeFilters[key].length;
      badge.textContent = count;
      badge.style.display = count > 0 ? "" : "none";
    });
  }

  /* --- URL-based filter persistence --- */
  function syncFiltersToUrl() {
    var params = new URLSearchParams();
    var query = searchInput.value.trim();
    if (query) params.set("q", query);
    Object.keys(activeFilters).forEach(function(key) {
      if (activeFilters[key].length) {
        params.set(key, activeFilters[key].join(","));
      }
    });
    var newUrl = params.toString() ? "?" + params.toString() : window.location.pathname;
    history.replaceState(null, "", newUrl);
  }

  function restoreFiltersFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q) searchInput.value = q;
    FILTER_KEYS.forEach(function(key) {
      var val = params.get(key);
      if (val) {
        activeFilters[key] = val.split(",");
        activeFilters[key].forEach(function(v) {
          var chip = getChip(key, v);
          if (chip) {
            chip.classList.add("active");
            chip.setAttribute("aria-pressed", "true");
          }
        });
        // Auto-expand groups that have active filters
        var group = document.querySelector('.filter-group[data-group="' + key + '"]');
        if (group && activeFilters[key].length) {
          group.classList.add("open");
          var header = group.querySelector(".filter-group-header");
          if (header) header.setAttribute("aria-expanded", "true");
        }
      }
    });
    _skipUrlSync = true;
    updateCards();
    _skipUrlSync = false;
  }

  /* --- Chip click with pop animation --- */
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var group = chip.closest("[data-filter]");
      if (!group) return;
      var filterKey = group.dataset.filter;
      var value = chip.dataset.value;

      var idx = activeFilters[filterKey].indexOf(value);
      if (idx !== -1) {
        activeFilters[filterKey].splice(idx, 1);
        chip.classList.remove("active");
        chip.setAttribute("aria-pressed", "false");
      } else {
        activeFilters[filterKey].push(value);
        chip.classList.add("active");
        chip.setAttribute("aria-pressed", "true");
      }

      // Pop animation
      chip.classList.add("pop");
      chip.addEventListener("animationend", function() {
        chip.classList.remove("pop");
      }, { once: true });

      updateCards();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", debounce(updateCards, 150));
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      searchInput.value = "";
      activeFilters.specializations = [];
      activeFilters.frameworks = [];
      activeFilters.languages = [];
      activeFilters.available = [];
      activeFilters.certifications = [];
      chips.forEach(function (c) { c.classList.remove("active"); c.setAttribute("aria-pressed", "false"); });
      history.replaceState(null, "", window.location.pathname);
      updateCards();
    });
  }

  /* --- "/" keyboard shortcut to focus search --- */
  document.addEventListener("keydown", function (e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) return;
    if (e.key === "/" && searchInput) {
      e.preventDefault();
      searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
      searchInput.focus();
    }
  });

  /* --- Hero stat count-up animation --- */
  var statEls = document.querySelectorAll(".hero-stat-num[data-target]");
  if (statEls.length) {
    var duration = 1500;
    var start = null;
    var counterFrameId = null;

    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function animateCounters(timestamp) {
      if (!start) start = timestamp;
      var elapsed = timestamp - start;
      var progress = Math.min(elapsed / duration, 1);
      var easedProgress = easeOut(progress);

      statEls.forEach(function (el) {
        var target = parseInt(el.dataset.target, 10);
        el.textContent = Math.round(easedProgress * target);
      });

      if (progress < 1) {
        counterFrameId = requestAnimationFrame(animateCounters);
      } else {
        counterFrameId = null;
      }
    }

    counterFrameId = requestAnimationFrame(animateCounters);
  }

  /* --- Restore filters from URL on load --- */
  restoreFiltersFromUrl();
})();
