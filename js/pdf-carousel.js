(function ($) {
  var repoUrl = 'https://api.github.com/repos/Mario-GB/clinica-pies/contents/docs/articles';
  var files = [];
  var currentIndex = 0;
  var $track = $('#pdfTrack');
  var $prev = $('.pdf-prev');
  var $next = $('.pdf-next');

  function getVisibleCount() {
    // Mostrar siempre un único documento en el carrusel
    return 1;
  }

  function getPreloadCount() {
    // Pre-cargar el documento actual + el siguiente para evitar latencia al avanzar
    return 2;
  }

  function extractNumber(fileName) {
    var match = String(fileName).match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
  }

  function normalizeFiles(list) {
    return $.grep(list || [], function (item) {
      return item && item.type === 'file' && /\.pdf$/i.test(String(item.name || ''));
    }).map(function (item) {
      return {
        name: String(item.name),
        url: item.download_url || item.html_url || ''
      };
    }).sort(function (a, b) {
      return extractNumber(a.name) - extractNumber(b.name);
    });
  }

  function updateButtons() {
    var visibleCount = getVisibleCount();
    var maxIndex = Math.max(0, files.length - visibleCount);
    $prev.prop('disabled', currentIndex <= 0);
    $next.prop('disabled', currentIndex >= maxIndex);
  }

  function viewerUrl(rawUrl) {
    return 'https://docs.google.com/viewer?embedded=true&url=' + encodeURIComponent(rawUrl);
  }

  function render() {
    if (!files.length) {
      $track.html('<div class="pdf-empty">No hay documentos disponibles.</div>');
      return;
    }

    var visibleCount = getVisibleCount();
    var preloadCount = getPreloadCount();
    var totalToRender = Math.min(files.length, Math.max(visibleCount, preloadCount));
    var start = Math.max(0, Math.min(currentIndex, files.length - totalToRender));
    var slice = files.slice(start, start + totalToRender);

    $track.empty();

    $.each(slice, function (i, item) {
      var $item = $('<div class="pdf-item"></div>');
      // Cargar eager el actual y el siguiente para eliminar latencia al avanzar
      var loadingMode = (i === 0 || i === 1) ? 'eager' : 'lazy';
      var $frame = $('<iframe>', {
        src: viewerUrl(item.url),
        title: item.name,
        loading: loadingMode
      });
      $item.append($frame);
      $track.append($item);
    });

    updateButtons();
  }

  function loadFiles() {
    $.ajax({
      url: repoUrl,
      method: 'GET',
      dataType: 'json',
      headers: {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }).done(function (response) {
      files = normalizeFiles(response || []);
      if (!files.length) {
        $track.html('<div class="pdf-empty">No hay documentos disponibles.</div>');
        return;
      }

      // Empezar en el primer documento
      currentIndex = 0;
      render();
    }).fail(function (xhr) {
      var message = 'No se pudieron cargar los documentos.';
      if (xhr && xhr.responseJSON && xhr.responseJSON.message) {
        message = xhr.responseJSON.message;
      }
      $track.html('<div class="pdf-empty">' + message + '</div>');
    });
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

    if (currentIndex <= 0) {
      $prev.prop('disabled', true);
    }
    $next.prop('disabled', currentIndex >= maxIndex);
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

    if (currentIndex >= maxIndex) {
      $next.prop('disabled', true);
    }
    $prev.prop('disabled', currentIndex <= 0);
  }

  $(function () {
    $prev.on('click', goPrevious);
    $next.on('click', goNext);
    $(window).on('resize', render);
    loadFiles();
  });
})(jQuery);
