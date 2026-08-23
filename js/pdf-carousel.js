(function () {
  var repoUrl = 'https://api.github.com/repos/Mario-GB/clinica-pies/contents/docs/articles';
  var files = [];
  var currentIndex = 0;
  var track = document.getElementById('pdfTrack');
  var prev = document.querySelector('.pdf-prev');
  var next = document.querySelector('.pdf-next');

  if (!track || !prev || !next) {
    return;
  }

  function getVisibleCount() {
    return 1;
  }

  function getPreloadCount() {
    return 2;
  }

  function extractNumber(fileName) {
    var match = String(fileName).match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
  }

  function normalizeFiles(list) {
    return (list || [])
      .filter(function (item) {
        return item && item.type === 'file' && /\.pdf$/i.test(String(item.name || ''));
      })
      .map(function (item) {
        return {
          name: String(item.name),
          url: item.download_url || item.html_url || ''
        };
      })
      .sort(function (a, b) {
        return extractNumber(a.name) - extractNumber(b.name);
      });
  }

  function updateButtons() {
    var visibleCount = getVisibleCount();
    var maxIndex = Math.max(0, files.length - visibleCount);
    prev.disabled = currentIndex <= 0;
    next.disabled = currentIndex >= maxIndex;
  }

  function viewerUrl(rawUrl) {
    return 'https://docs.google.com/viewer?embedded=true&url=' + encodeURIComponent(rawUrl);
  }

  function render() {
    if (!files.length) {
      track.innerHTML = '<div class="pdf-empty">No hay documentos disponibles.</div>';
      return;
    }

    var visibleCount = getVisibleCount();
    var preloadCount = getPreloadCount();
    var totalToRender = Math.min(files.length, Math.max(visibleCount, preloadCount));
    var start = Math.max(0, Math.min(currentIndex, files.length - totalToRender));
    var slice = files.slice(start, start + totalToRender);

    track.innerHTML = '';

    slice.forEach(function (item, index) {
      var itemNode = document.createElement('div');
      itemNode.className = 'pdf-item';
      var loadingMode = (index === 0 || index === 1) ? 'eager' : 'lazy';
      var frame = document.createElement('iframe');
      frame.src = viewerUrl(item.url);
      frame.title = item.name;
      frame.loading = loadingMode;
      itemNode.appendChild(frame);
      track.appendChild(itemNode);
    });

    updateButtons();
  }

  function loadFiles() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', repoUrl, true);
    xhr.setRequestHeader('Accept', 'application/vnd.github+json');
    xhr.setRequestHeader('X-GitHub-Api-Version', '2022-11-28');

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) {
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var response = JSON.parse(xhr.responseText);
          files = normalizeFiles(response || []);
          if (!files.length) {
            track.innerHTML = '<div class="pdf-empty">No hay documentos disponibles.</div>';
            return;
          }

          currentIndex = 0;
          render();
        } catch (error) {
          track.innerHTML = '<div class="pdf-empty">No se pudieron cargar los documentos.</div>';
        }
        return;
      }

      var message = 'No se pudieron cargar los documentos.';
      try {
        var jsonResponse = JSON.parse(xhr.responseText || '{}');
        if (jsonResponse && jsonResponse.message) {
          message = jsonResponse.message;
        }
      } catch (error) {
        // Ignored.
      }
      track.innerHTML = '<div class="pdf-empty">' + message + '</div>';
    };

    xhr.onerror = function () {
      track.innerHTML = '<div class="pdf-empty">No se pudieron cargar los documentos.</div>';
    };

    xhr.send();
  }

  function goPrevious() {
    if (!files.length) {
      return;
    }

    var maxIndex = Math.max(0, files.length - getVisibleCount());
    if (currentIndex > 0) {
      currentIndex = Math.max(0, currentIndex - 1);
      render();
    }

    prev.disabled = currentIndex <= 0;
    next.disabled = currentIndex >= maxIndex;
  }

  function goNext() {
    if (!files.length) {
      return;
    }

    var maxIndex = Math.max(0, files.length - getVisibleCount());
    if (currentIndex < maxIndex) {
      currentIndex = Math.min(maxIndex, currentIndex + 1);
      render();
    }

    prev.disabled = currentIndex <= 0;
    next.disabled = currentIndex >= maxIndex;
  }

  prev.addEventListener('click', goPrevious);
  next.addEventListener('click', goNext);
  window.addEventListener('resize', render);
  loadFiles();
})();
