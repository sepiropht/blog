(function() {
  angular
    .module('blog')
    .controller('addArticleController', addArticleController)
    .controller('editArticlesController', editArticlesController)

     function addArticleController($scope, $http, $stateParams, $location) {
       var vm = this;
       $http.get('/categories').success(function (data) {
         vm.categories = data;
       });

       vm.addArticle = function() {
         debugger;
         var data = {
           title: vm.title,
           body: vm.body,
           category: vm.category
         };
         $http.post('/articles', data).success(function (data, status) {
         console.log(status);
         $location.path('/articles');
       });
       }

     }

     function editArticlesController($scope, $http, $stateParams, $location) {
       var vm = this;
       $http.get('/categories').success(function (data) {
         vm.categories = data;
       });

        $http.get('/articles/' + $stateParams.id).success(function (data) {
         vm.title = data.title;
         vm.categoy = data.category;
         vm.body = data.body;
       });

       vm.updateArticle = function() {
         var data = {
           id: $stateParams.id,
           title: vm.title,
           body: vm.body,
           category: vm.category
         };
         $http.put('/articles', data).success(function (data, status) {
         console.log(status);
         $location.path('/articles');
       });
       }

     }


})();
