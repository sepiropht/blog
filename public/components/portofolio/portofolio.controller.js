(function() {
  angular
    .module('blog')
    .controller('portofolioController', portofolioController);

     function portofolioController($scope, $http) {
       var vm = this;
       $http.get('/portofolio').success(function (data) {
         vm.portofolio = data;
       });
        $http.get('/portofolio').success(function (data) {
         vm.portofolio = data;
       });

     }
})();
