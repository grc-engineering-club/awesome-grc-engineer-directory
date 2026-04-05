(function () {
  /* ── Helpers ── */
  function isDark() {
    return window.getEffectiveTheme() === "dark";
  }

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
  var isMobile = window.innerWidth < 600;

  /* ── Particles ── */
  function particleColor() {
    return getComputedStyle(document.documentElement).getPropertyValue("--brand-primary").trim() || "#e8650a";
  }
  function linkColor() {
    return getComputedStyle(document.documentElement).getPropertyValue("--brand-primary-20").trim() || "rgba(232,101,10,0.2)";
  }

  function initParticles() {
    if (reducedMotion || lowEnd || typeof tsParticles === "undefined") return;

    tsParticles.load({
      id: "tsparticles",
      options: {
        fullScreen: { enable: false },
        fpsLimit: 60,
        particles: {
          number: { value: isMobile ? 18 : 45 },
          color: { value: particleColor() },
          opacity: { value: { min: 0.3, max: 0.6 } },
          size: { value: { min: 1.5, max: 4 } },
          links: {
            enable: true,
            color: linkColor(),
            distance: 160,
            opacity: 0.35,
            width: 1,
          },
          move: {
            enable: true,
            speed: 0.8,
            outModes: { default: "bounce" },
          },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: "grab" },
            onClick: { enable: false },
          },
          modes: {
            grab: { distance: 180, links: { opacity: 0.6 } },
          },
        },
        detectRetina: true,
      },
    });
  }

  function reloadParticles() {
    var container = tsParticles.domItem(0);
    if (container) container.destroy();
    initParticles();
  }

  /* ── Charts ── */
  var chartInstances = [];

  var PALETTE = [
    "#e8650a",   // orange (brand primary)
    "#f59e0b",   // amber
    "#d4a017",   // gold (certs)
    "#c2410c",   // dark orange
    "#ea580c",   // orange-red
    "#b45309",   // brown-orange
    "#f97316",   // light orange
    "#dc2626"    // red accent
  ];

  function chartTextColor() {
    return getComputedStyle(document.documentElement).getPropertyValue("--text-secondary").trim() || (isDark() ? "#a0a0a0" : "#555555");
  }

  function chartDefaults() {
    return {
      color: chartTextColor(),
      plugins: {
        legend: { labels: { color: chartTextColor(), font: { size: 11 } } },
      },
      scales: {
        x: { ticks: { color: chartTextColor() } },
        y: { ticks: { color: chartTextColor() } },
      },
    };
  }

  function initCharts() {
    if (typeof Chart === "undefined") return;

    var el = document.getElementById("chart-data");
    if (!el) return;
    var data;
    try { data = JSON.parse(el.textContent); } catch (e) { return; }

    Chart.defaults.color = chartTextColor();

    /* Specializations — horizontal bar */
    var specLabels = Object.keys(data.specializations).slice(0, 8);
    var specValues = specLabels.map(function (k) { return data.specializations[k]; });

    chartInstances.push(new Chart(document.getElementById("chart-specs"), {
      type: "bar",
      data: {
        labels: specLabels,
        datasets: [{
          data: specValues,
          backgroundColor: PALETTE.slice(0, specLabels.length),
          borderWidth: 0,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: chartTextColor(), stepSize: 1 }, grid: { display: false } },
          y: { ticks: { color: chartTextColor() }, grid: { display: false } },
        },
      },
    }));

    /* Frameworks — doughnut */
    var fwLabels = Object.keys(data.frameworks).slice(0, 8);
    var fwValues = fwLabels.map(function (k) { return data.frameworks[k]; });

    chartInstances.push(new Chart(document.getElementById("chart-frameworks"), {
      type: "doughnut",
      data: {
        labels: fwLabels,
        datasets: [{
          data: fwValues,
          backgroundColor: PALETTE.slice(0, fwLabels.length),
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "right", labels: { color: chartTextColor(), font: { size: 10 }, boxWidth: 12 } },
        },
      },
    }));

    /* Languages — horizontal bar */
    var langLabels = Object.keys(data.languages || {}).slice(0, 8);
    var langValues = langLabels.map(function (k) { return data.languages[k]; });

    if (langLabels.length) {
      chartInstances.push(new Chart(document.getElementById("chart-languages"), {
        type: "bar",
        data: {
          labels: langLabels,
          datasets: [{
            data: langValues,
            backgroundColor: PALETTE.slice(0, langLabels.length),
            borderWidth: 0,
          }],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: chartTextColor(), stepSize: 1 }, grid: { display: false } },
            y: { ticks: { color: chartTextColor() }, grid: { display: false } },
          },
        },
      }));
    }

    /* Availability — polar area */
    var availLabels = Object.keys(data.available_for);
    var availValues = availLabels.map(function (k) { return data.available_for[k]; });

    chartInstances.push(new Chart(document.getElementById("chart-available"), {
      type: "polarArea",
      data: {
        labels: availLabels,
        datasets: [{
          data: availValues,
          backgroundColor: PALETTE.slice(0, availLabels.length).map(function (c) { return c + "cc"; }),
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "right", labels: { color: chartTextColor(), font: { size: 10 }, boxWidth: 12 } },
        },
        scales: {
          r: { ticks: { display: false }, grid: { color: isDark() ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" } },
        },
      },
    }));
  }

  function updateChartColors() {
    var color = chartTextColor();
    chartInstances.forEach(function (c) {
      c.options.color = color;
      if (c.options.plugins && c.options.plugins.legend && c.options.plugins.legend.labels) {
        c.options.plugins.legend.labels.color = color;
      }
      if (c.options.scales) {
        ['x', 'y'].forEach(function (axis) {
          if (c.options.scales[axis] && c.options.scales[axis].ticks) {
            c.options.scales[axis].ticks.color = color;
          }
        });
        if (c.options.scales.r && c.options.scales.r.grid) {
          c.options.scales.r.grid.color = isDark() ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
        }
      }
      c.update("none");
    });
  }

  /* ── Theme reactivity ── */
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.attributeName === "data-theme") {
        if (!reducedMotion && !lowEnd && typeof tsParticles !== "undefined") {
          reloadParticles();
        }
        if (chartInstances.length) {
          Chart.defaults.color = chartTextColor();
          updateChartColors();
        }
      }
    });
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  /* ── Init ── */
  function init() {
    initParticles();
    initCharts();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(init, 50);
    });
  } else {
    setTimeout(init, 50);
  }
})();
