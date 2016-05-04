angular.module('siteApp').controller("clientAdminController",["$scope","database", "socket",'fileUpload',"$window", function($scope,database, client, fileUpload, $window){

  var self=this;

  $scope.currentChats=[];
  $scope.currentTab=0;
  $scope.currentMessage="";
  $scope.myFiles=[];
  $scope.currentClient="Poids Plume";
  $scope.position_data=null;
  $scope.adding_hotspot=false;
  $scope.newHotspot = {};
  //view variables
  $scope.activeTab="page-admin";
  //Pannellum variables
  this.currentScene="";
  $scope.hotspotTab=0;
  $scope.currentHotspot=0;
  $scope.hot_value=0;
  $scope.showSceneMenu=false;
  $scope.newScene = {"name" : "new-scene",
                    "data" : {
                            "hotSpots": [],
                            "panorama": "../resources/client-content/pannellum-placeholder.jpg",
                            "type": "equirectangular",
                            "yaw": 5,
                            "hfov": 110,
                            "title": "New Scene"
                        }
                    };
  //Admin connect
  client.emit("admin connect");

  $scope.$watch(
    function () {
        return $window.position_data
    }, function(n,o){
       $scope.position_data=n;
    }
);

$scope.$watch(
  function () {
      return $window.viewer
  }, function(n,o){
     $scope.viewer=n;
  }
);

  $scope.changeClient = function(){
    database.getClients({name : $scope.currentClient}, function(data){
      $scope.client = data[0];
      $scope.pageContent = $scope.client.page_content;
      self.currentScene=$scope.client.page_content.iframe_content.default.firstScene;
      $scope.currentHotspot=0;
    });
  }

  $scope.changeClient();

  $scope.generateSceneName = function(){
    $scope.newScene.name = $scope.newScene.data.title.split(' ').join('-').toLowerCase();
  }

  $scope.getChatNumber=function(username){
    var i=0;
    var found=false;
    while(!found && i<$scope.currentChats.length){
      if ($scope.currentChats[i].client==username){
        found=true;
      }
      else{i++;}
    }
    return i;
  }

  $scope.switchActiveTab = function(tab){
    $scope.activeTab=tab;
  }

  $scope.sendMessage = function(){
    var msg={"username" : "Administrador", "mail":"none", "to":$scope.currentChats[$scope.currentTab-1].id ,"message": $scope.currentMessage};
    $scope.currentChats[$scope.currentTab-1].messages.push(msg);
    client.emit("chat message",msg );
    $('#chatbox').animate({scrollTop: $('#chatbox')[0].scrollHeight});
    $scope.currentMessage="";
    $("#message-area").focus();
  };

  $scope.setActiveChat = function(value){
    $scope.currentTab=value;
    $('#chatbox').animate({scrollTop: $('#chatbox')[0].scrollHeight});
    $("#message-area").focus();
  }

  //Socket IO event handlers
  client.on("new chat", function(data, id){
    var messages = [];
    messages.push(data);
    $scope.currentChats.push({"client" : data.username, "id":id, "messages":messages });
  });

  client.on("send message", function(data){
    if (data.username!="Administrador"){
      $scope.currentChats[$scope.getChatNumber(data.username)].messages.push(data);
    }
      $('#chatbox').animate({scrollTop: $('#chatbox')[0].scrollHeight});
  });



  //Funciones de modificación de formulario
  $scope.changePage = function(){
    if ($scope.client.template_type=='carousel' || typeof($scope.myFiles[0]) == 'undefined'){
      database.updateClientPage($scope.client.name, $scope.pageContent,function(data){
        alert("La modificación se completó con éxito.");
      });
    }
    else if ($scope.client.template_type=='static-photo' || $scope.client.template_type=='panoramic'){
      var file = $scope.myFiles[0];
      var uploadUrl = '/uploadImage';
      var serverpath ='/resources/client-content/';
      fileUpload.uploadFileToUrl(file, uploadUrl,serverpath, function(filename){
        $scope.pageContent.iframe_content.image_name = filename;
        database.updateClientPage($scope.client.name, $scope.pageContent,function(data){
          alert("Imagen cargada con éxito!");
        });
      });
    }
  };


  //Funciones de modificación de formulario
  $scope.changeSlider = function(){
    var uploadUrl = '/uploadImage';
    var serverpath ='/resources/client-content/';
    var acks=0;
    var len = 0;
    for (i in $scope.myFiles){
      len++;
    }
    if (len==0){
      database.updateClientPage($scope.client.name, $scope.pageContent,function(data){
        alert("Se ha realizado la modificación con éxito.");
      });
    }
    else{
      for (i in $scope.myFiles){
        var file=$scope.myFiles[i];
        fileUpload.uploadFileToUrl(file, uploadUrl,serverpath, function(filename){
          $scope.pageContent.iframe_content.slides[i].image = filename;
          acks++;
          if (acks==len){
            database.updateClientPage($scope.client.name, $scope.pageContent,function(data){
              $scope.myFiles=[];
              alert("Galería modificada con éxito!");
            });

          }

        });
      }
    }
  }

  $scope.removeSection =function(index){
    $scope.pageContent.features.splice(index,1);
  }

  $scope.removeSlide =function(index){
    $scope.pageContent.iframe_content.slides.splice(index,1);
  }

  $scope.addSection =function(){
    $scope.pageContent.features.push({"title" : "Titulo", "content":"Contenido"});
  }

  $scope.addSlide =function(){
    $scope.pageContent.iframe_content.slides.push({"image" : "placeholder400x400.png", "caption":"Texto de la filmina"});
  }

  $scope.isFile = function(index){
    return typeof($scope.myFiles[index])=='undefined';
  }

  $scope.createHotspot = function(){
    $scope.adding_hotspot=true;
    $scope.newHotspot={
                "pitch": $scope.position_data.pitch,
                "yaw": $scope.position_data.yaw,
                "type": "info",
                "text": "Texto",
                "sceneId": self.currentScene,
                "targetYaw": 0,
                "targetPitch": 0
      };
  }

  $scope.changeScene=function(){
    $.getScript("../node_modules/pannellum-mod/build/pannellum.js", function(){
      $scope.viewer.loadScene(self.currentScene,0,0,0);
    });
  }

  $scope.addHotspot=function(){
      var hotspots = [];
      for (i in $scope.pageContent.iframe_content.scenes[self.currentScene].hotSpots){
        hotspots.push($scope.pageContent.iframe_content.scenes[self.currentScene].hotSpots[i]);
      }
      hotspots.push($scope.newHotspot);
      $scope.pageContent.iframe_content.scenes[self.currentScene].hotSpots=hotspots;
      $scope.adding_hotspot=false;
      $scope.viewer.loadScene(self.currentScene,0,0,0);
  }

  $scope.changeCurrentHotspot=function(valor){
    $scope.currentHotspot=valor;
  }

  $scope.removeHotspot=function(){
      var hotspots = [];
      for (i in $scope.pageContent.iframe_content.scenes[self.currentScene].hotSpots){
        if (i!=$scope.currentHotspot){
          hotspots.push($scope.pageContent.iframe_content.scenes[self.currentScene].hotSpots[i]);}
      }
      $scope.pageContent.iframe_content.scenes[self.currentScene].hotSpots=hotspots;
      $scope.viewer.loadScene(self.currentScene,0,0,0);
      $scope.currentHotspot='0';
  }

  $scope.editHotspot=function(){
      $scope.viewer.loadScene(self.currentScene,0,0,0);
  }

  $scope.switchHotspotTab=function(val){
    $scope.hotspotTab=val;
    $scope.adding_hotspot=false;
  }

  $scope.removeScene = function(){
    var erased =self.currentScene;
    var validKeys=[];
    for (var key in $scope.pageContent.iframe_content.scenes) {
      if (key!=erased){
        validKeys.push(key);
      }
    }
    if (validKeys.length >0){
      delete $scope.pageContent.iframe_content.scenes[self.currentScene];
      self.currentScene=validKeys[0];
      if ($scope.pageContent.iframe_content.default.firstScene == erased){
        $scope.pageContent.iframe_content.default.firstScene=validKeys[0];
      }
      $scope.viewer.loadScene(self.currentScene,0,0,0);
    }
    else{
      alert("Esta es actualmente la única escena de la presentación! No se puede borrar. Agregue más escenas si desea borrar esta de modo que haya al menos una.");
    }
  }

  $scope.addScene = function(){
    //upload
    var file = $scope.myFiles[0];
    var uploadUrl = '/uploadImage';
    var serverpath ='/resources/client-content/';
    fileUpload.uploadFileToUrl(file, uploadUrl,serverpath, function(filename){
      $scope.newScene.data.panorama = "../resources/client-content/"+filename;
      //update
      $scope.pageContent.iframe_content.scenes[$scope.newScene.name] = $scope.newScene.data;
      self.currentScene = $scope.newScene.name;
      $scope.showSceneMenu=false;
      $scope.viewer.loadScene(self.currentScene,0,0,0);
    });
  }

  $scope.toggleSceneMenu = function(val){
    $scope.showSceneMenu=val;
  }

  $scope.saveTour = function(){
    database.updateClientPage($scope.client.name, $scope.pageContent,function(data){
      alert("La modificación se completó con éxito.");
    });
  }

}]);
