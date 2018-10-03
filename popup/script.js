var regex = /<script type='application\/ld\+json'>\n({\s+"@context": "http:\/\/schema\.org",\s+"@type": "WebApplication",[\s\S]+?)<\/script>/g;

var month = new Array();
month[0] = "January";
month[1] = "February";
month[2] = "March";
month[3] = "April";
month[4] = "May";
month[5] = "June";
month[6] = "July";
month[7] = "August";
month[8] = "September";
month[9] = "October";
month[10] = "November";
month[11] = "December";

function httpGet(theUrl){
	let xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, true);
	xmlHttp.onreadystatechange = function () {
		if (xmlHttp.readyState != 4) return;

		var response = xmlHttp.responseText;
		var arr = regex.exec(response);
		var date = new Date(JSON.parse(arr[1]).dateModified);
		var version = JSON.parse(arr[1]).softwareVersion;
		var dateString = date.getDate() + "." + month[date.getMonth()] + "." + date.getFullYear();
		console.log(dateString+" , version: " + version);
	};
	xmlHttp.send();
}

function convertDate(date){

}

httpGet("https://forums.x-plane.org/index.php?/files/file/41411-fse/");
// httpGet("https://forums.x-plane.org/index.php?/files/file/46465-speedy-copilot-320-for-a320-ultimate/");