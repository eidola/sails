var releaseServices = angular.module('releaseServices', ['ngResource']);

releaseServices.factory('Release', ['$resource', function($resource){
    return $resource('releases', {}, {
	query: {method:'GET', isArray:true}
    });
}]);
