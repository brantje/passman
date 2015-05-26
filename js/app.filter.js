app.filter('phpTime', function($filter)
{
	return function(input)
	{
		if(input == null){ return ""; }

		var _date = $filter('date')(new Date(input*1000), 'dd-MM-yyyy H:mm:ss');

		return _date.toUpperCase();

	};
});

app.filter('secondstohuman', function() {
  return function(seconds,shortNotation) {
    shortNotation = (shortNotation) ? true : false;
    seconds = Math.floor(seconds)
    var numyears = Math.floor(seconds / 31536000);
    var numdays = Math.floor((seconds % 31536000) / 86400); 
    var numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
    var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
    var numseconds = (((seconds % 31536000) % 86400) % 3600) % 60;
    
    var str ="";
    if(!shortNotation){
      if(numyears > 0){
        str += numyears + " years "
      }
      if(numdays > 0){
        str += numdays + " days "
      }
      if(numhours > 0){
        str += numhours + " hours "
      }
      if(numminutes > 0){
        str += numminutes + " minutes "
      }
      if(numseconds > 0){
        str += numseconds + " seconds "
      }
      if(numyears===0&&numdays===0&&numhours===0&&numminutes===0&&numseconds==0){
        str = 'Instant'      
      } 
   }
    return str;
  }
});

app.filter('bytes', function() {
  return function(bytes, precision) {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
    if (typeof precision === 'undefined') precision = 1;
    var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
      number = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
  }
});

app.filter('to_trusted', ['$sce', function($sce){
        return function(text) {
            return $sce.trustAsHtml(text);
        };
}]);

app.filter('hide1970', [
function() {
  return function(text) {
    try {
      var d = new Date(text);
      if (d.getFullYear() < 1980) {
        return false;
      } else {
        return true;
      }
    } catch(e) {
      return false;
    }

  };
}]);
