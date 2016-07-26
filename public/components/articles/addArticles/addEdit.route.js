(function () {
  'use strict';


  angular
   .module('blog')
   .config(config);

  function config($urlRouterProvider, $stateProvider) {
    $stateProvider
      .state( 'add', {
        url: '/add',

        templateUrl: 'components/articles/addArticles/add.html',
        controller: 'addArticleController as vm'
    });
    $stateProvider
    .state( 'edit', {
        url: '/edit/:id',

        templateUrl: 'components/articles/addArticles/edit.html',
        controller: 'editArticlesController as vm'
    });

  }
})();
