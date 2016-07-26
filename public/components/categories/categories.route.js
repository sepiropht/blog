(function () {
  'use strict';


  angular
   .module('blog')
   .config(config);

  function config($urlRouterProvider, $stateProvider) {
    $stateProvider
      .state( 'categories', {
        url: '/categories',

        templateUrl: 'components/categories/categories.html',
        controller: 'categoriesController as vm'
    });

  }
})();
