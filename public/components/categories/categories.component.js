(function() {
  angular
    .module('blog')
    .controller('categoriesController', categoriesController);

     function categoriesController($scope, $http) {
       var vm = this;
       $http.get('/categories').success(function (data) {
         vm.categories = data;
       });
        $http.get('/articles').success(function (data) {
         vm.articles = data;
       });

     }
})();
