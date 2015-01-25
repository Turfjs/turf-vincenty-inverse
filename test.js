var test = require('tape');
var distance = require('./');

test('distance', function(t){
  var pt1 = {
    "type": "Feature",
    "geometry": {"type": "Point", "coordinates": [-75.343, 39.984]}
  };
  var pt2 = {
    "type": "Feature",
    "geometry": {"type": "Point", "coordinates": [-75.534, 39.123]}
  };

  t.end();
});
