(function() {
  angular
    .module('blog')
    .controller('articlesController', articlesController);

     function articlesController($scope, $http) {
       var vm = this;
       $http.get('/articles').success(function (data) {
         vm.articles = data;
       });
     }
})();
