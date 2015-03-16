var invariant = require('turf-invariant');
//http://en.wikipedia.org/wiki/Vincenty%27s_formulae
//https://gist.github.com/mathiasbynens/354587

module.exports = function(point1, point2, units) {
 invariant.featureOf(point1, 'Point', 'distance');
 invariant.featureOf(point2, 'Point', 'distance');
 var coordinates1 = point1.geometry.coordinates;
 var coordinates2 = point2.geometry.coordinates;

 var R;
  switch(units){
    case 'miles':
      R = 3960;
      break;
    case 'kilometers':
      R = 6373;
      break;
    case 'degrees':
      R = 57.2957795;
      break;
    case 'radians':
      R = 1;
      break;
    case undefined:
      R = 6373;
      break;
    default:
      throw new Error('unknown option given to "units"');
  }

 var a = 6378137, // length of semi-major axis of the ellipsoid (radius at equator);  (6378137.0 metres in WGS-84)
     b = 6356752.3142, // length of semi-minor axis of the ellipsoid (radius at the poles); (6356752.314245 meters in WGS-84)
     f = 1 / 298.257223563, // flattening of the ellipsoid; (1/298.257223563 in WGS-84)
     L = toRad(coordinates2[0]-coordinates1[0]),
     U1 = Math.atan((1 - f) * Math.tan(toRad(coordinates1[1]))),
     U2 = Math.atan((1 - f) * Math.tan(toRad(coordinates2[1]))),
     sinU1 = Math.sin(U1),
     cosU1 = Math.cos(U1),
     sinU2 = Math.sin(U2),
     cosU2 = Math.cos(U2),
     lambda = L,
     lambdaP,
     iterLimit = 100;
 do {
  var sinLambda = Math.sin(lambda),
      cosLambda = Math.cos(lambda),
      sinSigma = Math.sqrt((cosU2 * sinLambda) * (cosU2 * sinLambda) + (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda));
  if (0 === sinSigma) {
   return 0; // co-incident points
  };
  var cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda,
      sigma = Math.atan2(sinSigma, cosSigma),
      sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma,
      cosSqAlpha = 1 - sinAlpha * sinAlpha,
      cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha,
      C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
  if (isNaN(cos2SigmaM)) {
   cos2SigmaM = 0; // equatorial line: cosSqAlpha = 0 (§6)
  };
  lambdaP = lambda;
  lambda = L + (1 - C) * f * sinAlpha * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
 } while (Math.abs(lambda - lambdaP) > 1e-12 && --iterLimit > 0);
 
 if (!iterLimit) {
  return NaN; // formula failed to converge
 };
 
 var uSq = cosSqAlpha * (a * a - b * b) / (b * b),
     A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq))),
     B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq))),
     deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) - B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM))),
     s = b * A * (sigma - deltaSigma);
     distance = s * R; // unit conversion
 return distance;
};
function toRad(degree) {
 return degree * Math.PI / 180;
};