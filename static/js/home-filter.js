;(function () {
  var container = document.querySelector('.home-posts');
  if (!container) return;

  var buttons = document.querySelectorAll('.post-filter');

  function apply(filter) {
    // Show/hide individual posts.
    var items = container.querySelectorAll('.post-title');
    items.forEach(function (it) {
      var isX = it.dataset.x === 'true';
      var show = filter === 'all' || (filter === 'x' && isX) || (filter === 'blog' && !isX);
      it.style.display = show ? '' : 'none';
    });

    // Hide year headings that have no visible post under them.
    var years = container.querySelectorAll('.post-year');
    years.forEach(function (y) {
      var visible = false;
      var n = y.nextElementSibling;
      while (n && !n.classList.contains('post-year')) {
        if (n.classList.contains('post-title') && n.style.display !== 'none') {
          visible = true;
          break;
        }
        n = n.nextElementSibling;
      }
      y.style.display = visible ? '' : 'none';
    });
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      buttons.forEach(function (x) { x.classList.remove('is-active'); });
      b.classList.add('is-active');
      apply(b.dataset.filter);
    });
  });

  apply('all');
})();
