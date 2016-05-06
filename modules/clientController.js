angular.module('siteApp').controller("clientController",["$scope","$location","socket","database","$http", function($scope,$location,client,database,$http){

  $scope.user = "";
  $scope.mail="";
  $scope.currentMessage="";
  $scope.adminID=undefined;
  $scope.chat=[];
  $scope.noAdmins=false;
  $scope.loadComplete=false;
  $scope.messageCache="";

  angular.element(document).ready(function () {
        $scope.loadComplete=true;
    });


  //Get client info to isntatiate page content

  database.getClients({web_url : $location.path().split("/").pop()}, function(data){
    $scope.client = data[0];
    if (typeof $scope.client.page_content === "undefined" || $.isEmptyObject($scope.client.page_content)){
      alert ("Error cargando los datos del cliente.");
    }
    else{
      $scope.pageContent = $scope.client.page_content;
    }
  });

  $scope.getPanoramic = function(){
    var url = $scope.pageContent.iframe_content.image_name;
    return {'background-image': 'url(../resources/client-content/'+url+')'};
  }

  $scope.sendMessage = function(){

    if (!$scope.noAdmins){
      var msg= {"username" : $scope.user, "mail":$scope.mail, "to": $scope.adminID, "message": $scope.currentMessage};
      client.emit("chat message", msg);
      $scope.chat.push(msg);
      $scope.messageCache=$scope.currentMessage;
      $scope.currentMessage="";
      $("#message-area").focus();
      $('#chatbox').animate({scrollTop: $('#chatbox')[0].scrollHeight});
    }
    else{

    }
  };

  client.on("admin disconnected", function(){
    client.emit("leave room");
  });

  client.on("no admins", function(){
    $scope.noAdmins=true;
    if ($scope.noAdmins){
      var msg= {"username" : $scope.user, "mail":$scope.mail, "to":$scope.pageContent.chat_email, "message": $scope.messageCache};
      $http({
          method: 'GET',
          url: '/sendMessageEmail',
          params: msg,
       }).success(function(data){
          alert("¡El mail ha sido enviado con éxito!");
          location.reload();
      }).error(function(){
          alert("Error en el envío.");
      });
    }
  });

  client.on("send message", function(data){
    //Scroll chatbox to bottom
    $scope.chat.push(data);
    //Scroll chatbox to bottom
    $('#chatbox').animate({scrollTop: $('#chatbox')[0].scrollHeight});
  });

  client.on("set admin id", function(data){
    $scope.adminID = data;
  });


}]);
