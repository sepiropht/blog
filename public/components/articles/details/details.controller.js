(function() {
  angular
    .module('blog')
    .controller('articlesDetailsController', articlesDetailsController)
    .controller('articlesCategory', articlesCategory);

     function articlesDetailsController($scope, $http, $stateParams) {
       var vm = this;
       
       $http.get('/articles/' + $stateParams.id).success(function (data) {
         vm.article = data;
       });
     }

     function articlesCategory($scope, $http, $stateParams) {
       var vm = this;
       $http.get('/articles/category/' + $stateParams.category).success(function (data) {
         vm.cat_articles = data;
         vm.category = $stateParams.category;
       });
     }
})();
