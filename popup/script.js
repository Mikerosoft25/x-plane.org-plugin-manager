var regex = /<script type='application\/ld\+json'>\n({\s+"@context": "http:\/\/schema\.org",\s+"@type": "WebApplication",[\s\S]+?)<\/script>/gim;
var plugins = [];
var linkToggle = false;

// // console.log("plugins", plugins);

// function onCleared() {
//   console.log("OK");
// }

// function onError(e) {
//   console.log(e);
// }

// var clearStorage = browser.storage.local.clear();
// clearStorage.then(onCleared, onError);

var month = ["January","February","March","April","May","June","July","August","September","October","November","December"];

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
			var version = JSON.parse(arr[1]).softwareVersion;
			var pluginName = JSON.parse(arr[1]).name;
			var dateString = date.getDate() + "." + month[date.getMonth()] + "." + date.getFullYear();

			pushToArray(url,pluginName,version);
			saveStorage();
				
				// console.log("vers", version + " name: " + pluginName);
				// curVers.push(version);
				// console.log("curVers", curVers);
				// updateDivs(plugins, curVers);
	
			// console.log(dateString+" , version: " + version);

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
	// console.log("Saved.")

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
		linkToggle = true;
		if(toggle === 0){
			toggle = 1;
			var editImg = document.getElementById("editImg");
			editImg.setAttribute("src", "../icons/done.svg");

			addDelImgs();
		}
		else{
			toggle = 0;
			var editImg = document.getElementById("editImg");
			editImg.setAttribute("src", "../icons/edit.svg");

			linkToggle = false;
			removeDelImgs();
		}
	});
}

function addDelImgs(){
	var delDivs = document.querySelectorAll(".delDiv");
		// console.log(delDivs);	
		for (var i = 0; i < delDivs.length; i++) {
			var deleteImg = document.createElement("img");
			deleteImg.setAttribute("src", "../icons/delete.svg");
			deleteImg.style.float = "right";
			deleteImg.style.verticalAlign = "middle";
			deleteImg.style.height = "100%";
			deleteImg.classList.add("deleteImgs");
			delDivs[i].appendChild(deleteImg);														
			deleteImg.addEventListener("click", function(){
				deleteRow(this.parentElement.parentElement.parentElement.getAttribute("data-id"));
			}); 
	}	
}

function getCurVer(){
	var curVerDivs = document.querySelectorAll(".curVerDiv");
	console.log("curverdivs", curVerDivs);
	for (let i = 0; i < plugins.length; i++) {
		curVerDivs[i].innerHTML = "loading..."
		let xmlHttp = new XMLHttpRequest();
		xmlHttp.open("GET", plugins[i].url, true);
		xmlHttp.onreadystatechange = () => {
			if (xmlHttp.readyState != 4) return;
			// console.log("response code", xmlHttp.status);
			
			var response = xmlHttp.responseText;
			var arr = reg(response);
			var count = 0;
			while(!arr && count < 20){
				console.log("failed");
				arr = reg(response);
				count++;
			}

			// if(!arr){
			// 	// console.log("failed", response);
			// 	// getCurVer();
			// 	// console.log("json", JSON.parse(arr[1]).softwareVersion);
			// 	console.log("response", response);
			// 	console.log("regex", regex.exec(response));
			// 	curVerDivs[i].innerHTML = "failed... retry";
			// 	return;
			// }
			
			var version = JSON.parse(arr[1]).softwareVersion;
			// var version = JSON.parse(regex.exec(response)[1]).softwareVersion;
			console.log(version + ", " + plugins[i].name);
			console.log("curVer", curVerDivs[i]);

			curVerDivs[i].innerHTML = version;
		};
		xmlHttp.send();
	}
}

function reg(response){
	var arr = regex.exec(response);
	return arr;
}

if(refreshButton){
	refreshButton.addEventListener("click", function(){
		getCurVer();
		// updateDivs(plugins);
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
	addDelImgs();
}

function getTabId(){
	function logTabs(tabs) {
	  for (let tab of tabs) {
	    for (var i = 0; i < plugins.length; i++) {
	    	if(tab.url == plugins[i].url){
	    		console.log("already exists");
	    		return;
	    	}
	    }
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
		
		var wrapper = document.createElement("div");
		var topper = document.createElement("div");
		var footer = document.createElement("div");
		var nameDiv = document.createElement("div");
		var delDiv = document.createElement("div");
		var insVerDiv = document.createElement("div");
		var curVerDiv = document.createElement("div");

		wrapper.setAttribute("data-id", i);
		// console.log(wrapper.getAttribute("data-id"));

		topper.id = "topper";
		nameDiv.id = "nameDiv";
		insVerDiv.id = "insVerDiv";
		curVerDiv.classList.add("curVerDiv");
		delDiv.classList.add("delDiv");

		main.appendChild(wrapper);
		wrapper.appendChild(topper);
		wrapper.appendChild(footer);
		topper.appendChild(nameDiv);
		topper.appendChild(delDiv);
		footer.appendChild(insVerDiv);
		footer.appendChild(curVerDiv);
		
		var name = plugins[i].name;
		if(name.length > 50){
			name = name.slice(0,50) + "...";
		}
		nameDiv.innerHTML = name;

		insVerDiv.innerHTML = plugins[i].version;
		
		var URL = plugins[i].url;

		wrapper.addEventListener("click", function(){
			openLink(plugins[this.getAttribute("data-id")].url);
		});

		console.log("updated.")
	}
		
}

function openLink(url){
	if(linkToggle == false){
		window.open(url);	
	}
}
