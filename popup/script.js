var regex = /<script type='application\/ld\+json'>\n({\s+"@context": "http:\/\/schema\.org",\s+"@type": "WebApplication",[\s\S]+?)<\/script>/g;
var pluginName;
var version;
var dateString;
var plugins = [];

// function onCleared() {
//   console.log("OK");
// }

// function onError(e) {
//   console.log(e);
// }

// var clearStorage = browser.storage.local.clear();
// clearStorage.then(onCleared, onError);

var month = ["January","February","March","April","May","June","July","August","September","Octobre","November","December"];

getStorage().then(function(){
	updateDivs(plugins);
	console.log("loaded!");	
});

function httpGet(url){
	let xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", url, true);
	xmlHttp.onreadystatechange = function () {
		if (xmlHttp.readyState != 4) return;

		var response = xmlHttp.responseText;
		var arr = regex.exec(response);
		var date = new Date(JSON.parse(arr[1]).dateModified);
		version = JSON.parse(arr[1]).softwareVersion;
		pluginName = JSON.parse(arr[1]).name;
		dateString = date.getDate() + "." + month[date.getMonth()] + "." + date.getFullYear();


		pushToArray(url,pluginName,version);
		saveStorage();

		console.log(dateString+" , version: " + version);
	};
	xmlHttp.send();
}

function getStorage(){
	return browser.storage.local.get("plugins").then(function(storage) {
		if(storage.plugins){
			plugins = storage.plugins;
			console.log("plugins", plugins);
		}
	});
}

function pushToArray(url,name,version){
	plugins.push({url: url, name: name, version: version});
}

function saveStorage(){
	browser.storage.local.set({
			"plugins": plugins,
		});
	console.log("Saved.")

	getStorage();
	updateDivs(plugins);		
}

var addButton = document.getElementById('addButton');

if(addButton){
	addButton.addEventListener("click", function() {
		getTabId();
	});
}

var editButton = document.getElementById('editButton');
var toggle = 0;

if(editButton){
	editButton.addEventListener("click", function() {
		if(toggle == 0){
			toggle = 1;
			var editImg = document.getElementById("editImg");
			editImg.setAttribute("src", "../icons/done.svg");

			var divs = document.querySelectorAll(".pluginDiv");
			console.log(divs);	
			for (var i = 0; i < divs.length; i++) {
				var deleteImg = document.createElement("img");
				deleteImg.setAttribute("src", "../icons/delete.svg");
				deleteImg.setAttribute("align", "right");
				deleteImg.setAttribute("lineHeight", "40px");
				deleteImg.classList.add("deleteImgs");
				divs[i].appendChild(deleteImg);														
				deleteImg.addEventListener("click", function(){
					deleteRow(this.parentElement.id);
					console.log("id: " + this.parentElement.id);	
				}); 
			}	
		}
		else{
			toggle = 0;
			var editImg = document.getElementById("editImg");
			editImg.setAttribute("src", "../icons/edit.svg");

			removeDelImgs();
		}
	});
}

function removeDelImgs(){
	[].forEach.call(document.querySelectorAll('.deleteImgs'),function(e){
		e.parentNode.removeChild(e);
	});	
}

function deleteRow(id){
	plugins.splice(id, 1);
	saveStorage();
}

function getTabId(){
	function logTabs(tabs) {
	  for (let tab of tabs) {
	    httpGet(tab.url);
	  }
	}

	function onError(error) {
	  console.log(`Error: ${error}`);
	}

	var querying = browser.tabs.query({currentWindow: true, active: true});
	querying.then(logTabs, onError);
}

function updateDivs(plugins){
	var main = document.getElementById("main");
	while(main.firstChild){
		main.removeChild(main.firstChild)
	}

	for (var i = 0; i < plugins.length; i++) {
		var div = document.createElement("div");
		div.classList.add("pluginDiv");
		div.style.width = "100%";
		div.style.height = "40px";
		div.style.background = "#5c5757";
		div.style.color = "white";
		div.style.border = "1px solid #363434";
		div.style.lineHeight = "40px";
		div.id = i;
		div.innerHTML = "Plugin: " + plugins[i].name + " Version: " + plugins[i].version + " , " + div.id;

		main.appendChild(div);
		console.log("updated.")
	}
		
}

