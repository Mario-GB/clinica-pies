(function($){
  var images = [
    './img/clinic/0.jpg',
    './img/clinic/1.jpg',
    './img/clinic/2.jpg',
    './img/clinic/3.jpg',
    './img/clinic/4.jpg'
  ];

  var $track = $('#clinicTrack');
  var $prev = $('.clinic-prev');
  var $next = $('.clinic-next');
  var $dots = $('#clinicDots');
  var current = 0;

  function preload(src, cb) {
    var img = new Image();
    img.src = src;
    img.onload = function(){ if(cb) cb(); };
    img.onerror = function(){ if(cb) cb(); };
  }

  function render() {
    $track.empty();
    $dots.empty();
    images.forEach(function(src, i){
      var $slide = $('<div class="clinic-slide" role="group" aria-roledescription="slide" aria-label="'+(i+1)+' de '+images.length+'"></div>');
      var $wrap = $('<div class="img-wrap"></div>');
      var $img = $('<img>', { src: src, alt: 'Foto de la clínica ' + (i+1) });
      $wrap.append($img);
      $slide.append($wrap);
      $track.append($slide);

      var $dot = $('<button type="button" class="clinic-dot" aria-label="Ir a la foto '+(i+1)+'"></button>');
      $dot.on('click', function(){ goTo(i); });
      $dots.append($dot);

      // Preload small set: current, next
      if (i === current || i === Math.min(current+1, images.length-1)) preload(src);
    });

    update();
  }

  function update() {
    var translate = -current * 100;
    $track.css('transform', 'translateX('+translate+'%)');
    $dots.find('.clinic-dot').removeClass('active').eq(current).addClass('active');
    $prev.prop('disabled', current <= 0);
    $next.prop('disabled', current >= images.length-1);
  }

  function goNext(){ if(current < images.length-1){ current++; // preload next
      preload(images[Math.min(current+1, images.length-1)]);
      update(); }
  }
  function goPrev(){ if(current > 0){ current--; update(); } }
  function goTo(i){ current = Math.max(0, Math.min(i, images.length-1)); preload(images[Math.min(current+1, images.length-1)]); update(); }

  $(function(){
    render();
    $prev.on('click', goPrev);
    $next.on('click', goNext);
    $(document).on('keydown', function(e){
      if(e.key === 'ArrowLeft') goPrev();
      if(e.key === 'ArrowRight') goNext();
    });
    // Make slides swipeable on touch
    var startX = null;
    var threshold = 40;
    var stage = document.getElementById('clinicStage');
    if (stage) {
      stage.addEventListener('touchstart', function(e){ startX = e.touches[0].clientX; }, { passive: true });
      stage.addEventListener('touchmove', function(e){ if(startX === null) return; }, { passive: true });
      stage.addEventListener('touchend', function(e){
        if(startX === null) return;
        var dx = e.changedTouches[0].clientX - startX;
        if (dx > threshold) goPrev(); else if (dx < -threshold) goNext();
        startX = null;
      });
    }
  });
})(jQuery);