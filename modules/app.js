var app = angular.module("siteApp",[], function($locationProvider) {
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });
});

//Conditional injector for fileUpload
app.factory('uploader', ['$location', function ($location) {

  if ($location.url()=="center-admin"){
    return $injector.get('angularFileUpload');
  }
  else return {};

}]);

//Scoket IO
app.factory('socket', ['$rootScope', function ($rootScope) {
  var socket = io.connect();

  return {
    on: function (eventName, callback) {
      function wrapper() {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      }

      socket.on(eventName, wrapper);

      return function () {
        socket.removeListener(eventName, wrapper);
      };
    },

    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if(callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
}]);

//MongoDB Database service
app.service('database', ["$http", function($http) {

  //Get all clients
  this.getClients = function(query,callback){
    $http({
        method: 'GET',
        url: '/getClients',
        params: {"query" : query},
     }).success(function(data){
        callback(data);
    }).error(function(){
        alert("Error en el envío.");
    });
  };

  //Get all clients
  this.addClient = function(clientData, callback){
    $http.post('addClient', {"client" : clientData}).success(function(data){
        callback(data);
    }).error(function(){
        alert("Error en el envío.");
    });
  };

  //Get all clients
  this.updateClientPage = function(clientName,pageData, callback){
    $http.post('updateClientPage', {"client" : clientName, "data":pageData}).success(function(data){
        callback(data);
    }).error(function(){
        alert("Error en el envío.");
    });
  };

  //Get all clients
  this.updateEnabled = function(clientName,pageData, callback){
    $http.post('updateClientEnabled', {"client" : clientName, "data":pageData}).success(function(data){
        callback(data);
    }).error(function(){
        alert("Error en el envío.");
    });
  };

}]);

app.service('fileUpload', ['$http', function ($http) {
    this.getID = function(){
        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
          }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    this.uploadFileToUrl = function(file, uploadUrl, serverpath,callback){
        var fd = new FormData();
        //Get file extension
        var re = /(?:\.([^.]+))?$/;
        var ext = re.exec(file.name)[1];
        var newname = this.getID()+"."+ext;
        //Append data to form
        fd.append('serverpath',serverpath);
        fd.append('newname',newname);
        fd.append('file', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(){
          callback(newname);
        })
        .error(function(){
          console.log("Error cargando imagen al servidor");
        });
    }
}]);

//////////////////// DIRECTIVES ///////////////////////

//File upload directive
app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {

            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            element.bind('change', function(){
                scope.$apply(function(){
                  if (typeof (scope.$parent.myFiles)!='undefined'){
                      scope.$parent.myFiles[parseInt(attrs.index)] =element[0].files[0];
                  }
                  else{
                    modelSetter(scope, element[0].files[0]);
                  }
                });
            });
        }
    };
}]);


//Enter key press directive
app.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});

//Pannelum photo viewer directive
app.directive('clientTemplate', function(){
  return {
    restrict: 'E',
    templateUrl: '../views/directives/client-template.html',
    controller : "clientController",
    controllerAs: "clientCtrl"
  };
});

//Navigation bar directive
app.directive('navBar', function(){
  return {
    restrict: 'E',
    templateUrl: '../views/directives/nav-bar.html',
  };
});

//Pannelum photo viewer directive
app.directive('pannellum', function(){
  return {
    restrict: 'E',
    templateUrl: '../views/directives/pannellum.html',
    controller : function($scope){
      //Panorama div config
      $scope.reloadPannellum = function(pannellum_data){
        $.getScript("../node_modules/pannellum/build/pannellum.js", function(){
          pannellum.viewer('panorama', pannellum_data);
        });
      };
        //Cargar el objeto pannellum_data
      $scope.reloadPannellum($scope.pageContent.iframe_content);
    },
    controllerAs: "pannellumController"
  };

});

//Pannelum tour admin
app.directive('pannellumAdmin', function(){
  return {
    restrict: 'E',
  templateUrl: '../views/directives/pannellum.html',
    controller : function($scope,$window){
      //Panorama div config
      $scope.reloadPannellum = function(pannellum_data){
        $.getScript("../node_modules/pannellum-mod/build/pannellum.js", function(){
          $window.viewer = pannellum.viewer('panorama', pannellum_data);
          $scope.$apply();
        });
      }

        //Cargar el objeto pannellum_data
      $scope.reloadPannellum($scope.pageContent.iframe_content);

      $scope.marker = $('<span class="pannellum-cursor"><i class="fa fa-dot-circle-o fa-2x"></i> </span>');
      $("#panorama").on("click", function(ev){
        //Get offset
        $scope.$apply();
        var parentOffset = $(this).offset();
        //or $(this).offset(); if you really just want the current element's offset
        var relX = ev.pageX - parentOffset.left;
        var relY = ev.pageY - parentOffset.top;
        $scope.marker.css("top",relY);
        $scope.marker.css("left",relX);
        $(".pannelum-cursor").remove();
        $("#panorama").append($scope.marker);

      });
    },
    controllerAs: "pannellumController"
  };

});

//Pannelum photo viewer directive
app.directive('panoramic', function(){
  return {
    restrict: 'E',
    templateUrl: '../views/directives/panoramic.html',
    controller : function(){
      $(document).ready(function(){
        $.getScript("../modules/scripts/panoramic.js", function(){});
      })

    },
    controllerAs:"panoramicController"
  };
});

//Carousel directives
app.directive('carousel', function(){
  return {
    restrict: 'E',
    templateUrl: '../views/directives/carousel.html'
  };
});
