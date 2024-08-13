;(function () {
  var userLang = navigator.language || navigator.userLanguage
  userLang = userLang.split('-')[0] // Get the language code (e.g., 'en', 'fr')

  if (userLang === 'fr') {
    window.location.href = '/blog/fr/post'
  } else {
    window.location.href = '/blog/en/post'
  }
})()
