app.factory('DashboardFactory', function($http, $q, GeneratorFactory, $log){
    var obj = {};
    let getData = (res => res.data);
    obj.getDataSource = function(link){
        if(!link){
            return $q.when(null);
        }
        return $http.get(link)
        .then(getData)
        .then(function(data){
        let x = findDataToGraph(data);
        if (x) {
            return x;
        }else{
            return [data]
        }
        })
        .catch(res => [])
    }

    obj.getDashboard = function (dashboardId) {
        let dashboard;
        return $http.get('/api/dashboards/' + dashboardId)
        .then(getData)
        .then(function (_dashboard) {
            dashboard = _dashboard
            let promises = []
            dashboard.charts.forEach(function (e) {
                let prom = obj.getDataSource(e.dataSource);
                promises.push(prom);
                prom
                .then(function (sourceData) {
                    e.chart = {
                        options: GeneratorFactory[e.type].options(e.xparam, e.yparam),
                        data: [{
                            values:sourceData || [],
                            key: "this works",
                            color: '#ff7f0e'
                        }],
                        api: {}
                    }
                })
            })
            return Promise.all(promises)
        })
        .then(function(retstuff) {
            return dashboard
        })
    }

    obj.saveLayout = function (dashboardId, layout) {
        console.log(layout)
    	let obj = layout.map(function (e) {
    		return {
                name: e.name,
    			dataSource: e.dataSource || 'http://localhost:1337/api/dummyData/gitMosane', //this needs to change at some point
    			refreshInterval: e.refreshInterval || 1000,
    			type: e.type,
    			sizeX: e.sizeX,
    			sizeY: e.sizeY,
    			col: e.col,
    			row: e.row,
                color: e.color || '#0000ff',
                xparam: e.xparam,
    			dashboardId: dashboardId,
                yparam: e.yparam
    		}
    	})
    	return $http.put('/api/dashboards/' + dashboardId, obj)
        .then(getData)
    }

    obj.getCharts = function(dashboardId){
    return $http.get('/api/dashboards/' + dashboardId + '/charts')
    .then(function(res){
        console.log('this is in DashBoardFactory getCharts', res.data);
        return res.data
    })
    }

    return obj;

    function findDataToGraph(obj){
    if(Array.isArray(obj)){
      return obj;
    }else if(typeof(obj) === 'object'){
      var x;
      for(var key in obj){
       x = findDataToGraph(obj[key]);
       if(x){
        return x;
       }
      }
    }
  }
});
