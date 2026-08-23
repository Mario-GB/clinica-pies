(function () {
  var images = [
    'img/clinic/0.jpg',
    'img/clinic/1.jpg',
    'img/clinic/2.jpg',
    'img/clinic/3.jpg',
    'img/clinic/4.jpg'
  ];

  var track = document.getElementById('clinicTrack');
  var prev = document.querySelector('.clinic-prev');
  var next = document.querySelector('.clinic-next');
  var dots = document.getElementById('clinicDots');
  var current = 0;

  if (!track || !prev || !next || !dots) {
    return;
  }

  function preload(src) {
    var img = new Image();
    img.src = src;
  }

  function createElement(tagName, className, attributes) {
    var element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    if (attributes) {
      Object.keys(attributes).forEach(function (key) {
        element.setAttribute(key, attributes[key]);
      });
    }
    return element;
  }

  function render() {
    track.innerHTML = '';
    dots.innerHTML = '';

    images.forEach(function (src, index) {
      var slide = createElement('div', 'clinic-slide', {
        role: 'group',
        'aria-roledescription': 'slide',
        'aria-label': (index + 1) + ' de ' + images.length
      });
      var wrap = createElement('div', 'img-wrap');
      var img = createElement('img', '', {
        src: src,
        alt: 'Foto de la clínica ' + (index + 1)
      });
      wrap.appendChild(img);
      slide.appendChild(wrap);
      track.appendChild(slide);

      var dot = createElement('button', 'clinic-dot', {
        type: 'button',
        'aria-label': 'Ir a la foto ' + (index + 1)
      });
      dot.addEventListener('click', function () {
        goTo(index);
      });
      dots.appendChild(dot);

      if (index === current || index === Math.min(current + 1, images.length - 1)) {
        preload(src);
      }
    });

    update();
  }

  function update() {
    var translate = -current * 100;
    track.style.transform = 'translateX(' + translate + '%)';

    Array.prototype.forEach.call(dots.children, function (dot, index) {
      dot.classList.toggle('active', index === current);
    });

    prev.disabled = current <= 0;
    next.disabled = current >= images.length - 1;
  }

  function goNext() {
    if (current < images.length - 1) {
      current += 1;
      preload(images[Math.min(current + 1, images.length - 1)]);
      update();
    }
  }

  function goPrev() {
    if (current > 0) {
      current -= 1;
      update();
    }
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, images.length - 1));
    preload(images[Math.min(current + 1, images.length - 1)]);
    update();
  }

  function attachEvents() {
    prev.addEventListener('click', goPrev);
    next.addEventListener('click', goNext);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') {
        goPrev();
      }
      if (event.key === 'ArrowRight') {
        goNext();
      }
    });

    var startX = null;
    var threshold = 40;
    var stage = document.getElementById('clinicStage');
    if (stage) {
      stage.addEventListener('touchstart', function (event) {
        startX = event.touches[0].clientX;
      }, { passive: true });

      stage.addEventListener('touchend', function (event) {
        if (startX === null) {
          return;
        }

        var deltaX = event.changedTouches[0].clientX - startX;
        if (deltaX > threshold) {
          goPrev();
        } else if (deltaX < -threshold) {
          goNext();
        }
        startX = null;
      }, { passive: true });
    }
  }

  render();
  attachEvents();
})();