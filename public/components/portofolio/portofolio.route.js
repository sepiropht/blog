(function () {
  'use strict';


  angular
   .module('blog')
   .config(config);

  function config($urlRouterProvider, $stateProvider) {
    $stateProvider
      .state( 'portofolio', {
        url: '/portofolio',

        templateUrl: 'components/portofolio/portofolio.html',
        controller: 'portofolioController as vm'
    });

  }
})();
