var releaseControllers = angular.module('releaseControllers', []);

releaseControllers.controller('ReleaseListCtrl', ['$scope', 'Release', function($scope, Release) {
  $scope.releases = Release.query();
}]);


