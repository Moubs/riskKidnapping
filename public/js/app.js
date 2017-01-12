( function(){
  app = angular.module('firstApplication', ['ngMaterial']);
  app.controller('mainController', ['$scope','$http', function($scope,$http){
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
})();
