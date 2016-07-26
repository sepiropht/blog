(function () {
  'use strict';


  angular
   .module('blog')
   .config(config);

  function config($urlRouterProvider, $stateProvider) {
    $stateProvider
      .state( 'articles', {
        url: '/articles',

        templateUrl: 'components/articles/articles.html',
        controller: 'articlesController as vm'
    });

  }
})();
