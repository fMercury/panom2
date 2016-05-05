angular.module('siteApp').controller("centerAdminController",["$scope","database",'fileUpload', function($scope,database,fileUpload){

  //File uploader


  //New client variables
  $scope.newClientName="";
  $scope.newClientType="";
  $scope.newClientUrl="";
  $scope.newClientTemplate="";
  $scope.showNewClientForm=false;
  $scope.myFiles=[];

  $scope.getTypes = function(){
    var types=[];
    for (i in $scope.clients){
      if (!types.includes($scope.clients[i].client_data.category)){
        types.push($scope.clients[i].client_data.category);
      }
    }
    return types;
  };


  //Get all clients on app start
  database.getClients({"center" : "Test Center"},function(clients){
    $scope.clients = clients;
    $scope.availableTypes=$scope.getTypes();
  });


  $scope.searchText="";
  $scope.searchType="";

  //Functions
  $scope.toggleNewClientForm = function(){
    $scope.showNewClientForm = !$scope.showNewClientForm;
  }

  $scope.generateUrl = function(){
    $scope.newClientUrl = $scope.newClientName.split(' ').join('-').toLowerCase();
  }

  $scope.addClient= function(){
    var clientData = {"name" : $scope.newClientName,
                      "center" : "Test Center",
                      "image" : $scope.myFiles[0].name,               //hardcodero
                      "web_url": $scope.newClientUrl,
                      "template_type" : $scope.newClientTemplate,
                      "enabled" : true,
                      "page_content" : {
                          title : "This is who we are.",
                          subtitle: "A summary of the services and products we offer for our customers. ",
                          features : [{
                            title : "Sit amet.",
                            content : "Suspendisse malesuada laoreet pellentesque. In pulvinar neque ac ipsum commodo, quis tristique erat blandit."
                          },{
                            title : "Qui officia.",
                            content : "Praesent tincidunt justo a metus fringilla, nec iaculis lorem dignissim."
                          },{
                            title : "Occaecat cupidatat.",
                            content : "Mauris blandit porttitor neque in cursus. Quisque in porta nunc, sed elementum justo."
                          },{
                            title : "Donec feugiat mi odio.",
                            content : "Sit amet pharetra metus facilisis sit amet."
                          }],
                          iframe_enabled : true,
                          chat_enabled : true,
                          iframe_content : {"type" : $scope.newClientTemplate},
                          social_networks: {
                              "facebook": {
                                  "enabled": false,
                                  "url": "none"
                              },
                              "twitter": {
                                  "enabled": false,
                                  "url": "none"
                              },
                              "google_plus": {
                                  "enabled": false,
                                  "url": "none"
                              },
                              "instagram": {
                                  "enabled": false,
                                  "url": "none"
                              },
                              "youtube": {
                                  "enabled": false,
                                  "url": "none"
                              }
                          }},
                          "client_data":{"category": $scope.newClientType}
                        };   //hardcodero

    var file = $scope.myFiles[0];
    var uploadUrl = '/uploadImage';
    var serverpath ='/resources/logos/';
    fileUpload.uploadFileToUrl(file, uploadUrl,serverpath, function(filename){
      clientData.image=filename;
      database.addClient(clientData, function(){
          alert("Cliente cargado con éxito!");
          location.reload();
        });
    });
  }

  $scope.uploadFile = function(item){
    var file = $scope.myFiles[0];
    var uploadUrl = '/uploadImage';
    var serverpath ='/resources/logos/';
    fileUpload.uploadFileToUrl(file, uploadUrl,serverpath, path);
  };

  $scope.filterCategory = function(hotel){
    if (hotel.client_data.category == $scope.searchType || $scope.searchType==""){
      return true;
    }
    else return false;
  }

  $(document).ready(function(){
    var logoHeight = $('.client-div img').height();
    if (logoHeight < 128) {
        var margintop = (128 - logoHeight) / 2;
        $('.client-div img').css('margin-top', margintop);
    }
  });

}]);
