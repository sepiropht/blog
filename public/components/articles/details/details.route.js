(function () {
  'use strict';


  angular
   .module('blog')
   .config(config);

  function config($urlRouterProvider, $stateProvider) {
    $stateProvider
      .state( 'details', {
        url: '/details/:id',

        templateUrl: 'components/articles/details/details.html',
        controller: 'articlesDetailsController as vm'
    })
    .state( 'articleBycategory', {
        url: '/articleBycategory/:category',

        templateUrl: 'components/articles/details/cat_articles.html',
        controller: 'articlesCategory as vm'
    });

  }
})();
