( function(){
  app = angular.module('firstApplication', ['ngMaterial','datamaps','ngRoute']);
  app.config(function($routeProvider, $httpProvider){
    $httpProvider.defaults.withCredentials = true;
    $routeProvider
    .when("/",{
      controller:"mapController",
      templateUrl:"/static/views/map.html",
      controllerAs:"ctrl"
    })
    .when("/modifyDB",{
      templateUrl:"/static/views/modifyDB.html",
      controller:"dbController",
      controllerAs:"ctrl"
    })
    .when("/login",{
      templateUrl:"/static/views/login.html",
      controller:"loginController",
      controllerAs:"ctrl"
    })
    .when("/signin",{
      templateUrl:"/static/views/signin.html",
      controller:"signinController",
      controllerAs:"ctrl"
    })
    .when("/listUsers",{
      templateUrl:"/static/views/listUsers.html",
      controller:"usersController",
      controllerAs:"ctrl"
    })
    .when("/contact",{
      templateUrl:"/static/views/contact.html"
    });
  });

  app.run(['$rootScope', '$location', 'Auth', function ($rootScope, $location, Auth) {
    $rootScope.$on('$routeChangeStart', function (event) {
        if (!Auth.isLoggedIn() && ($location.path()!="/login" && $location.path()!="/signin")) {
            console.log('DENY');
            event.preventDefault();
            $location.path('/login');
        }else{
          /*
          if(!Auth.isAdmin() && $location.path()!=="/")
            $location.path("/");
            //*/
        }
    });
  }]);

  app.factory('Auth',function(){
    var user;
    var admin = false;
    return{
      setUser : function(aUser){
        user = aUser;
      },
      isLoggedIn : function(){
        return(user)? user : false;
      },
      setAdmin : function(aAdmin){
        admin=aAdmin;
      },
      isAdmin : function(){
        return(admin)? admin: false;
      }
    };
  });


  app.controller("mainController",['$scope', 'Auth', '$location', '$http',function ($scope, Auth, $location, $http) {
  $scope.isLogged = Auth.isLoggedIn;
  $scope.isAdmin = Auth.isAdmin;
  $scope.logout = function(){
    $http.get("/logout").success(function(data){
      var user;
      Auth.setAdmin(false);
      Auth.setUser(user);
    });
  };
  $scope.$watch(Auth.isLoggedIn, function (value, oldValue) {

     if(!value && oldValue) {
       console.log("Disconnect");
       $location.path('/login');
     }

     if(value) {
       console.log("Connect");
       //Do something when the user is connected
       $location.path('/');
       $http.get("/isAdmin").success(function(data){
         console.log(data);
         if(data)
          Auth.setAdmin(data);
       });
     }

   }, true);
   $http.get("/isLog").success(function(data){
     if (data)
      Auth.setUser(true);
   });
  }]);

  app.controller('usersController',['$scope','$http', function($scope,$http){
    $scope.users=[];
    $http.get("/getUsers").success(function(data){
      $scope.users = data;
    });
    $scope.grantAdmin = function(email){
      var data ={};
      data.email = email;
      $http.post("/grantAdmin",data,'Content-Type : application/json').success(function(data){
        $scope.users = data;
      });
    }
  }]);

  app.controller('loginController',['$scope','Auth','$http',function($scope,Auth,$http){
    $scope.login = function(){
      $http.post('/login',$scope.user,'Content-Type: application/json').success(function(data){
        Auth.setUser(data);
      });
    }
  }]);

  app.controller('signinController',['$scope','Auth','$http',function($scope,Auth,$http){
    $scope.register = function(){
      $http.post('/register',$scope.user,'Content-Type: application/json').success(function(data){
        Auth.setUser(data);
      });
    }
  }]);

  app.controller('dbController', ['$scope','$http', function($scope,$http){
    var self = this;
    // list of `state` value/display objects
    self.querySearch   = querySearch;
    self.selectedItemChange = selectedItemChange;
    self.country = {};
    self.searchTextChange = searchTextChange;
    self.saveCountry = saveCountry;
    //*
    //*/

    $scope.country = {};
    loadAll();

    function saveCountry(country){
      console.log(country);
      country.riskDescription = country.riskDescription.split("\n");
      country.advice = country.advice.split("\n");
      $http.post('/saveCountry',country,'Content-Type: application/json').success(function(data){
        $scope.country = {};
        $scope.country.name=data.name;
        self.country=data;
      });
    }

    function selectedItemChange(item){
      if (item!=null){
        self.country.name = item.value;
        console.log(self.country);
        $http.post('/getCountry',self.country,'Content-Type: application/json').success(function(data){
          $scope.country = (JSON.parse(JSON.stringify(data)));
          self.country = data;
          $scope.country.riskDescription = data.riskDescription.join("\n");
          $scope.country.advice = data.advice.join("\n");
        });
      }
    }

    function searchTextChange(name){
      $scope.country.name=name;
      self.country={};
    }

    function querySearch(query){
      loadAll()
      if (query!=null){
        var results=[]
        var i;
        for( i = 0; i<self.listcountries.length; i++){
          if (self.listcountries[i].value.indexOf(query.toLowerCase())==0){
            results.push(self.listcountries[i]);
          }
        }
        return results;
      }else{
      //  console.log(self.listcountries)
        return self.listcountries
      }
    }

    function loadAll(){
      $http.get('/allCountryName').success(function(data){
        self.listcountries = data.map(function(country){
          return {
            value: country.name.toLowerCase(),
            display: country.name
          }
        });
      });
      //console.log(self.listcountries);
      return self.listcountries
    }
  }]);

  app.controller("mapController",['$scope','$http', '$mdSidenav',function($scope,$http,$mdSidenav){
    var paletteScale = d3.scale.linear().domain([1,2,3,4]).range(["#00FF00","#F17507","#FF0000","#FFFFFF"]);
    var isoAndRisk = [];
    var dataset = {};
    $scope.showAutoComplete = true;
    $http.get('/getISOandRisk').success(function(data){
      console.log(data);
      data.forEach(function(item){
        var iso = item.iso;
        var name = item.name.charAt(0).toUpperCase()+item.name.slice(1);
        if (item.riskLevel!= null){
          var risk = item.riskLevel;
          dataset[iso] = {name:name, riskLevel:risk, fillColor:paletteScale(risk)};
        }else{
          dataset[iso] = {name:name, riskLevel:"non renseigné", fillColor:"#b9b9b9"};
        }
      });
      console.log(dataset);
    });
    $scope.toggleRight = function(){$mdSidenav("right").toggle();};
    $scope.closeSideNav = function(){$mdSidenav("right").close();};
    $scope.mapObject = {
      scope: 'world',
      options: {
        height: 700
      },
      data: dataset,
      fils : {defaultFill: '#b9b9b9'},
      geographyConfig: {
        highlighBorderColor: '#EAA9A8',
        highlighBorderWidth: 2,
        highlightFillColor: function(geo) {
            return geo['fillColor'] || '#b9b9b9';
        },
        popupTemplate: function(geo,data){
          if (!data){return ;}
          return ['<div class="hoverinfo">',
          '<strong>', data.name, '</strong>',
          '<br>Niveau de risque: <strong>', data.riskLevel, '</strong>',
          '</div>'].join('');
        }
      }
    };

    $scope.updateActiveGeography = function(geo){
      console.log(geo.id);
      item = {value:dataset[geo.id].name};
      selectedItemChange(item);
    }

    var self = this;
    // list of `state` value/display objects
    self.querySearch   = querySearch;
    self.selectedItemChange = selectedItemChange;
    self.country = {};
    self.searchTextChange = searchTextChange;
    //*
    //*/

    $scope.country = {};
    loadAll();

    function selectedItemChange(item){
      if (item!=null){
        self.country.name = item.value;
        $http.post('/getCountry',self.country,'Content-Type: application/json').success(function(data){
          self.country = data;
          self.country.name = data.name.charAt(0).toUpperCase() + data.name.slice(1);
          if(!$mdSidenav("right").isOpen())
            $scope.toggleRight();
        });
      }
    }

    function searchTextChange(name){
      self.country={};
    }

    function querySearch(query){
      loadAll()
      if (query!=null){
        var results=[]
        var i;
        for( i = 0; i<self.listcountries.length; i++){
          if (self.listcountries[i].value.indexOf(query.toLowerCase())==0){
            results.push(self.listcountries[i]);
          }
        }
        return results;
      }else{
      //  console.log(self.listcountries)
        return self.listcountries
      }
    }

    function loadAll(){
      $http.get('/allCountryName').success(function(data){
        self.listcountries = data.map(function(country){
          return {
            value: country.name.toLowerCase(),
            display: country.name
          }
        });
      });
      //console.log(self.listcountries);
      return self.listcountries
    }



  }]);
})();
