(function () {
  'use strict';

  var REPO_OWNER = 'GRCEngClub';
  var REPO_NAME = 'directory';
  var GH_USERNAME_RE = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

  // Post-submission confirmation
  if (window.location.search.indexOf('submitted=1') !== -1) {
    var banner = document.createElement('div');
    banner.className = 'success-banner';
    banner.textContent = 'Your profile has been submitted successfully! It will appear on the site after review.';
    var main = document.querySelector('main') || document.body;
    main.insertBefore(banner, main.firstChild);
  }

  // --- State ---
  var state = {
    specializations: [],
    frameworks: [],
    languages: [],
    available_for: [],
    certifications: [],
    projects: []
  };

  // --- DOM helpers ---
  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return document.querySelectorAll(sel); }

  // --- Step Navigation ---
  var currentStep = 1;

  function showStep(n) {
    $$('.form-step').forEach(function (el) {
      el.hidden = +el.dataset.step !== n;
    });
    $$('.step-indicator .step').forEach(function (el) {
      var s = +el.dataset.step;
      el.classList.toggle('active', s === n);
      el.classList.toggle('completed', s < n);
      if (s === n) {
        el.setAttribute('aria-current', 'step');
        el.removeAttribute('aria-disabled');
      } else {
        el.removeAttribute('aria-current');
        if (s > n) el.setAttribute('aria-disabled', 'true');
        else el.removeAttribute('aria-disabled');
      }
    });
    currentStep = n;
    if (n === 4) renderPreview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Step nav buttons
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-next]');
    if (btn) {
      if (validateStep(currentStep)) showStep(+btn.dataset.next);
      return;
    }
    btn = e.target.closest('[data-prev]');
    if (btn) {
      showStep(+btn.dataset.prev);
      return;
    }
  });

  // Step indicator clicks
  $$('.step-indicator .step').forEach(function (el) {
    el.addEventListener('click', function () {
      var target = +el.dataset.step;
      if (target < currentStep) {
        showStep(target);
      } else if (target === currentStep + 1) {
        if (validateStep(currentStep)) showStep(target);
      }
    });
  });

  // --- Chip selectors ---
  $$('.chip-selector').forEach(function (container) {
    var field = container.dataset.field;
    container.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      chip.classList.toggle('active');
      syncChips(container, field);
    });
  });

  function syncChips(container, field) {
    state[field] = [];
    container.querySelectorAll('.chip.active').forEach(function (c) {
      state[field].push(c.dataset.value);
    });
  }

  // Custom chip helper (shared by specializations & languages)
  function addCustomChip(inputEl, containerId, fieldName) {
    var val = inputEl.value.trim();
    if (!val) return;
    var container = $(containerId);
    var existing = container.querySelector('.chip[data-value="' + CSS.escape(val) + '"]');
    if (existing) { existing.classList.add('active'); inputEl.value = ''; syncChips(container, fieldName); return; }
    var chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip active';
    chip.dataset.value = val;
    chip.textContent = val;
    container.appendChild(chip);
    inputEl.value = '';
    syncChips(container, fieldName);
  }

  // Custom specialization
  var addSpecBtn = $('#add-custom-specialization');
  var customSpecInput = $('#custom-specialization');
  if (addSpecBtn) {
    addSpecBtn.addEventListener('click', function () { addCustomChip(customSpecInput, '#chips-specializations', 'specializations'); });
    customSpecInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); addCustomChip(customSpecInput, '#chips-specializations', 'specializations'); }
    });
  }

  // Custom language
  var addLangBtn = $('#add-custom-language');
  var customLangInput = $('#custom-language');
  if (addLangBtn) {
    addLangBtn.addEventListener('click', function () { addCustomChip(customLangInput, '#chips-languages', 'languages'); });
    customLangInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); addCustomChip(customLangInput, '#chips-languages', 'languages'); }
    });
  }

  // --- Tag input (certifications) ---
  var certInput = $('#field-certifications');
  var certTagsEl = $('#cert-tags');

  if (certInput) {
    certInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var val = certInput.value.trim();
        if (val && state.certifications.indexOf(val) === -1) {
          state.certifications.push(val);
          renderCertTags();
        }
        certInput.value = '';
      }
    });
  }

  function renderCertTags() {
    certTagsEl.innerHTML = '';
    state.certifications.forEach(function (cert, i) {
      var span = document.createElement('span');
      span.className = 'tag tag-outline tag-removable';
      span.textContent = cert + ' ';
      var removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.dataset.removeCert = i;
      removeBtn.innerHTML = '&times;';
      span.appendChild(removeBtn);
      certTagsEl.appendChild(span);
    });
  }

  certTagsEl && certTagsEl.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-remove-cert]');
    if (!btn) return;
    state.certifications.splice(+btn.dataset.removeCert, 1);
    renderCertTags();
  });

  // --- Projects ---
  var projectsList = $('#projects-list');
  var addProjectBtn = $('#add-project');

  addProjectBtn && addProjectBtn.addEventListener('click', function () {
    if (state.projects.length >= 5) return;
    state.projects.push({ name: '', url: '', description: '' });
    renderProjects();
  });

  function renderProjects() {
    projectsList.innerHTML = '';
    state.projects.forEach(function (proj, i) {
      var div = document.createElement('div');
      div.className = 'project-entry';
      div.innerHTML =
        '<div class="project-entry-header"><strong>Project ' + (i + 1) + '</strong><button type="button" class="btn-remove" data-remove-project="' + i + '">&times;</button></div>' +
        '<input type="text" placeholder="Project name" value="' + escHtml(proj.name) + '" data-proj="' + i + '" data-field="name">' +
        '<input type="url" placeholder="https://github.com/..." value="' + escHtml(proj.url) + '" data-proj="' + i + '" data-field="url">' +
        '<input type="text" placeholder="Brief description" value="' + escHtml(proj.description) + '" data-proj="' + i + '" data-field="description">';
      projectsList.appendChild(div);
    });
    addProjectBtn.style.display = state.projects.length >= 5 ? 'none' : '';
  }

  projectsList && projectsList.addEventListener('input', function (e) {
    var input = e.target;
    if (input.dataset.proj !== undefined) {
      state.projects[+input.dataset.proj][input.dataset.field] = input.value;
    }
  });

  projectsList && projectsList.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-remove-project]');
    if (!btn) return;
    state.projects.splice(+btn.dataset.removeProject, 1);
    renderProjects();
  });

  // --- GitHub avatar preview ---
  var githubInput = $('#field-github');
  var avatarPreview = $('#github-avatar-preview');

  githubInput && githubInput.addEventListener('blur', function () {
    var username = githubInput.value.trim();
    if (!username || !GH_USERNAME_RE.test(username)) {
      avatarPreview.hidden = true;
      return;
    }
    var img = new Image();
    img.onload = function () {
      avatarPreview.src = img.src;
      avatarPreview.alt = username;
      avatarPreview.hidden = false;
    };
    img.onerror = function () { avatarPreview.hidden = true; };
    img.src = 'https://github.com/' + username + '.png?size=80';
  });

  // --- Validation ---
  function setError(field, msg) {
    var el = $('#error-' + field);
    if (el) el.textContent = msg;
  }
  function clearErrors() {
    $$('.form-error').forEach(function (el) { el.textContent = ''; });
  }

  function validateStep(step) {
    clearErrors();
    var valid = true;
    if (step === 1) {
      var gh = githubInput.value.trim();
      if (!gh) { setError('github', 'GitHub username is required.'); valid = false; }
      else if (!GH_USERNAME_RE.test(gh)) { setError('github', 'Invalid GitHub username. Must be 1-39 chars, alphanumeric or hyphens, no leading/trailing hyphens.'); valid = false; }
      var name = $('#field-name').value.trim();
      if (!name) { setError('name', 'Name is required.'); valid = false; }
      if (state.specializations.length === 0) { setError('specializations', 'Select at least one specialization.'); valid = false; }
    }
    if (step === 2) {
      var li = $('#field-linkedin').value.trim();
      if (li && !/^https?:\/\/(www\.)?linkedin\.com\/in\//.test(li)) {
        setError('linkedin', 'Must be a LinkedIn profile URL (https://linkedin.com/in/…)'); valid = false;
      }
      var blog = $('#field-blog').value.trim();
      if (blog && !/^https?:\/\//.test(blog)) {
        setError('blog', 'Must start with http:// or https://'); valid = false;
      }
    }
    if (step === 3) {
      // Validate project URLs
      var projError = false;
      state.projects.forEach(function (p) {
        if (p.url && !/^https?:\/\//.test(p.url)) projError = true;
      });
      if (projError) { setError('projects', 'Project URLs must start with http:// or https://'); valid = false; }
    }
    return valid;
  }

  // --- Markdown Generation ---
  function generateMarkdown() {
    var d = getFormData();
    var lines = ['---'];
    lines.push('name: "' + escYaml(d.name) + '"');
    lines.push('github: "' + escYaml(d.github) + '"');
    lines.push('specializations:');
    d.specializations.forEach(function (s) { lines.push('  - "' + escYaml(s) + '"'); });

    if (d.title) lines.push('title: "' + escYaml(d.title) + '"');
    if (d.company) lines.push('company: "' + escYaml(d.company) + '"');
    if (d.location) lines.push('location: "' + escYaml(d.location) + '"');
    if (d.linkedin) lines.push('linkedin: "' + escYaml(d.linkedin) + '"');
    if (d.twitter) lines.push('twitter: "' + escYaml(d.twitter) + '"');
    if (d.bluesky) lines.push('bluesky: "' + escYaml(d.bluesky) + '"');
    if (d.blog) lines.push('blog: "' + escYaml(d.blog) + '"');
    if (d.huggingface) lines.push('huggingface: "' + escYaml(d.huggingface) + '"');

    if (d.frameworks.length) {
      lines.push('frameworks:');
      d.frameworks.forEach(function (f) { lines.push('  - "' + escYaml(f) + '"'); });
    }
    if (d.languages.length) {
      lines.push('languages:');
      d.languages.forEach(function (l) { lines.push('  - "' + escYaml(l) + '"'); });
    }
    if (d.certifications.length) {
      lines.push('certifications:');
      d.certifications.forEach(function (c) { lines.push('  - "' + escYaml(c) + '"'); });
    }
    if (d.available_for.length) {
      lines.push('available_for:');
      d.available_for.forEach(function (a) { lines.push('  - "' + escYaml(a) + '"'); });
    }
    if (d.projects.length) {
      lines.push('projects:');
      d.projects.forEach(function (p) {
        if (!p.name) return;
        lines.push('  - name: "' + escYaml(p.name) + '"');
        if (p.url) lines.push('    url: "' + escYaml(p.url) + '"');
        if (p.description) lines.push('    description: "' + escYaml(p.description) + '"');
      });
    }
    lines.push('---');
    lines.push('');

    if (d.about) {
      lines.push('## About Me');
      lines.push('');
      lines.push(d.about);
      lines.push('');
    }
    if (d.highlights) {
      lines.push('## Experience Highlights');
      lines.push('');
      d.highlights.split('\n').forEach(function (line) {
        line = line.trim();
        if (line) lines.push('- ' + line);
      });
      lines.push('');
    }
    if (d.contact) {
      lines.push('## Get in Touch');
      lines.push('');
      lines.push(d.contact);
      lines.push('');
    }

    return lines.join('\n');
  }

  function getFormData() {
    return {
      github: githubInput.value.trim(),
      name: $('#field-name').value.trim(),
      specializations: state.specializations.slice(),
      title: ($('#field-title').value || '').trim(),
      company: ($('#field-company').value || '').trim(),
      location: ($('#field-location').value || '').trim(),
      linkedin: ($('#field-linkedin').value || '').trim(),
      twitter: ($('#field-twitter').value || '').trim(),
      bluesky: ($('#field-bluesky').value || '').trim(),
      blog: ($('#field-blog').value || '').trim(),
      huggingface: ($('#field-huggingface').value || '').trim(),
      frameworks: state.frameworks.slice(),
      languages: state.languages.slice(),
      certifications: state.certifications.slice(),
      available_for: state.available_for.slice(),
      projects: state.projects.filter(function (p) { return p.name; }),
      about: ($('#field-about').value || '').trim(),
      highlights: ($('#field-highlights').value || '').trim(),
      contact: ($('#field-contact').value || '').trim()
    };
  }

  // --- Preview ---
  function renderPreview() {
    var d = getFormData();
    var avatarUrl = 'https://github.com/' + encodeURIComponent(d.github) + '.png?size=120';
    var html = '<div class="profile-header">';
    html += '<img class="profile-avatar" src="' + escHtml(avatarUrl) + '" alt="' + escHtml(d.name) + '">';
    html += '<div>';
    html += '<div class="profile-name">' + escHtml(d.name) + '</div>';
    if (d.title) html += '<div class="profile-title">' + escHtml(d.title) + (d.company ? ' at ' + escHtml(d.company) : '') + '</div>';
    else if (d.company) html += '<div class="profile-company">' + escHtml(d.company) + '</div>';
    if (d.location) html += '<div class="profile-location">' + escHtml(d.location) + '</div>';
    var socials = [];
    if (d.linkedin) socials.push('<a href="' + escHtml(d.linkedin) + '">LinkedIn</a>');
    if (d.twitter) socials.push('<a href="https://x.com/' + escHtml(d.twitter.replace(/^@/, '')) + '">Twitter</a>');
    if (d.bluesky) socials.push('<a href="https://bsky.app/profile/' + escHtml(d.bluesky) + '">Bluesky</a>');
    if (d.huggingface) socials.push('<a href="https://huggingface.co/' + escHtml(d.huggingface) + '">Hugging Face</a>');
    if (d.blog) socials.push('<a href="' + escHtml(d.blog) + '">Blog</a>');
    socials.push('<a href="https://github.com/' + escHtml(d.github) + '">GitHub</a>');
    html += '<div class="profile-socials">' + socials.join('') + '</div>';
    html += '</div></div>';

    // Sections
    html += '<div class="profile-sections">';
    html += '<div class="profile-section"><h2>Specializations</h2><div class="tags">';
    d.specializations.forEach(function (s) { html += '<span class="tag tag-accent">' + escHtml(s) + '</span>'; });
    html += '</div></div>';

    if (d.languages.length) {
      html += '<div class="profile-section"><h2>Languages & Tools</h2><div class="tags">';
      d.languages.forEach(function (l) { html += '<span class="tag tag-language">' + escHtml(l) + '</span>'; });
      html += '</div></div>';
    }

    if (d.frameworks.length) {
      html += '<div class="profile-section"><h2>Frameworks</h2><div class="tags">';
      d.frameworks.forEach(function (f) { html += '<span class="tag tag-outline">' + escHtml(f) + '</span>'; });
      html += '</div></div>';
    }
    if (d.certifications.length) {
      html += '<div class="profile-section"><h2>Certifications</h2><div class="tags">';
      d.certifications.forEach(function (c) { html += '<span class="tag tag-outline">' + escHtml(c) + '</span>'; });
      html += '</div></div>';
    }
    if (d.available_for.length) {
      html += '<div class="profile-section"><h2>Available For</h2><div class="tags">';
      d.available_for.forEach(function (a) { html += '<span class="tag tag-available">' + escHtml(a) + '</span>'; });
      html += '</div></div>';
    }
    html += '</div>';

    // Projects
    if (d.projects.length) {
      html += '<div class="profile-section"><h2>Projects</h2><div class="project-list">';
      d.projects.forEach(function (p) {
        html += '<div class="project-card">';
        html += '<div class="project-name">' + (p.url ? '<a href="' + escHtml(p.url) + '">' + escHtml(p.name) + '</a>' : escHtml(p.name)) + '</div>';
        if (p.description) html += '<div class="project-desc">' + escHtml(p.description) + '</div>';
        html += '</div>';
      });
      html += '</div></div>';
    }

    // Body
    if (d.about) {
      html += '<div class="profile-body"><h2>About Me</h2>';
      d.about.split('\n\n').forEach(function (p) { if (p.trim()) html += '<p>' + escHtml(p.trim()) + '</p>'; });
      html += '</div>';
    }
    if (d.highlights) {
      html += '<div class="profile-body"><h2>Experience Highlights</h2><ul>';
      d.highlights.split('\n').forEach(function (line) {
        line = line.trim();
        if (line) html += '<li>' + escHtml(line) + '</li>';
      });
      html += '</ul></div>';
    }
    if (d.contact) {
      html += '<div class="profile-body"><h2>Get in Touch</h2>';
      d.contact.split('\n\n').forEach(function (p) { if (p.trim()) html += '<p>' + escHtml(p.trim()) + '</p>'; });
      html += '</div>';
    }

    $('#profile-preview').innerHTML = html;
  }

  // --- Submit to GitHub ---
  var submitBtn = $('#btn-submit-github');
  submitBtn && submitBtn.addEventListener('click', function () {
    var d = getFormData();
    var markdown = generateMarkdown();
    var issueTitle = 'New Profile: ' + d.github;
    var issueBody = '<!-- PROFILE_SUBMISSION -->\n```yaml\n' + markdown + '```';
    var issueUrl = 'https://github.com/' + REPO_OWNER + '/' + REPO_NAME + '/issues/new'
      + '?title=' + encodeURIComponent(issueTitle)
      + '&body=' + encodeURIComponent(issueBody)
      + '&labels=' + encodeURIComponent('profile-submission');

    window.open(issueUrl, '_blank');
    if (window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname + '?submitted=1');
    }
  });

  // --- Utilities ---
  function escHtml(s) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(s));
    return div.innerHTML;
  }

  function escYaml(s) {
    return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
  }
})();
