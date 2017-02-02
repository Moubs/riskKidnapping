( function(){
  app = angular.module('firstApplication', ['ngMaterial','datamaps']);
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

  app.controller("mapController",['$scope','$http',function($scope,$http){
    var paletteScale = d3.scale.linear().domain([0,50,100]).range(["#00FF00","#e2ea0d","#FF0000"]);
    var isoAndRisk = [];
    var dataset = {};
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

    $scope.mapObject = {
      scope: 'world',
      options: {
        width: 1110,
        legendHeight: 60 // optionally set the padding for the legend
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
  }]);
})();
