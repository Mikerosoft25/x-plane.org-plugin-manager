var regex = /<script type='application\/ld\+json'>\n({\s+"@context": "http:\/\/schema\.org",\s+"@type": "WebApplication",[\s\S]+?)<\/script>/gim;
var plugins = [];
var curVers = [];

// function onCleared() {
//   console.log("OK");
// }
// function onError(e) {
//   console.log(e);
// }
// var clearStorage = browser.storage.local.clear();
// clearStorage.then(onCleared, onError);

getStorage().then(function(){
	addDivs(plugins, curVers);
	getVersions();
});

function getStorage(){
	return browser.storage.local.get("plugins").then(function(storage) {
		if(storage.plugins){
			plugins = storage.plugins;
		}
	});
}

function saveStorage(){
	browser.storage.local.set({
			"plugins": plugins,
		});

	getStorage();
	addDivs(plugins, curVers);	
}

function httpGet(url, callback){
	let xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", url, true);
	xmlHttp.onreadystatechange = function () {
		if (xmlHttp.readyState != 4) return;

		var response = xmlHttp.responseText;

		for (var i = 0; i < 20 && !arr; i++) {
			var arr = regex.exec(response);	
		}
		if(!arr) {
			toast("Something went wrong!");
		}	

		var obj = {
			url: url,
			name: JSON.parse(arr[1]).name,
			version: JSON.parse(arr[1]).softwareVersion,
			date: new Date(JSON.parse(arr[1]).dateModified)
		}

		callback(obj);
	};
	xmlHttp.send();
}

var addButton = document.getElementById('addDiv');

if(addButton){
	addButton.addEventListener("click", function() {
		getTabId().then(function(url) {
			httpGet(url, function(obj) {
				if(!checkExists(obj)){
					plugins.push(obj);
					curVers[plugins.length-1] = obj.version;
					saveStorage();
					addDivs(plugins, curVers);
					getVersions();	
				}
			});
		});
	});
}

function checkExists(obj){
	for (var i = 0; i < plugins.length; i++) {
		if(plugins[i].name == obj.name){
			if(plugins[i].version == obj.version){
				toast("This plugin is up to date!");
			}
			else{
				plugins[i].version = obj.version;
				saveStorage();
				toast("plugin updated!");
			}
			return true;	
		}
	}
	return false;
}

function getTabId(){
	return browser.tabs.query({currentWindow: true, active: true}).then(function(tabs) {
		return tabs[0].url;
	});
}

function addDivs(plugins, curVers){
	var main = document.getElementById("main");
	while(main.firstChild){
		main.removeChild(main.firstChild)
	}

	for (var i = 0; i < plugins.length; i++) {
		
		var wrapper = document.createElement("div");
		var topper = document.createElement("div");
		var footer = document.createElement("div");
		var nameDiv = document.createElement("div");
		var imgDiv = document.createElement("div");
		var insVerDiv = document.createElement("div");
		var curVerDiv = document.createElement("div");

		wrapper.setAttribute("data-id", i);

		nameDiv.classList.add("nameDiv", "divs");
		insVerDiv.classList.add("insVerDiv", "divs");
		curVerDiv.classList.add("curVerDiv", "divs");
		imgDiv.classList.add("imgDiv", "divs");

		main.appendChild(wrapper);
		wrapper.appendChild(topper);
		wrapper.appendChild(footer);
		topper.appendChild(nameDiv);
		topper.appendChild(imgDiv);
		footer.appendChild(insVerDiv);
		footer.appendChild(curVerDiv);
		
		var name = plugins[i].name;
		if(name.length > 40){
			name = name.slice(0,40) + "...";
		}
		nameDiv.innerHTML = name;

		insVerDiv.innerHTML = plugins[i].version;

		if(curVers.length > 0){
			if (typeof curVers[i] != 'undefined') {
				curVerDiv.innerHTML = curVers[i];
			}
		}
		
		var URL = plugins[i].url;

		nameDiv.addEventListener("click", function(){
			window.open(plugins[this.parentElement.parentElement.getAttribute("data-id")].url);
		});

		if(plugins.length >= 12){
			console.log(plugins.length);
			document.body.style.overflow = "scroll";
			document.body.style.overflowX = "hidden";
		}
	}
}

var refreshButton = document.getElementById('refreshDiv');

if(refreshButton){
	refreshButton.addEventListener("click", function() {
		getVersions();
	});
}

function getVersions(){
	removeImgs();

	var imgDivs = document.querySelectorAll(".imgDiv");

	for (let i = 0; i < plugins.length; i++) {
		loading(imgDivs[i]);
		httpGet(plugins[i].url, function(obj) {	
			curVers[i] = obj.version;

			addDivs(plugins, curVers);
			checkVers();
		});
	}	
}

var editButton = document.getElementById('editDiv');
var toggle = true;

if(editButton){
	editButton.addEventListener("click", function(){
		removeImgs();
		if(toggle){
			addDelImgs();
			var editImg = document.getElementById("editImg");
			editImg.setAttribute("src", "../icons/done.svg");
			toggle = false;
		}
		else{
			removeImgs();
			var editImg = document.getElementById("editImg");
			editImg.setAttribute("src", "../icons/edit.svg");
			toggle = true;
			checkVers();
		}
	});
}

function addDelImgs(){
	var imgDivs = document.querySelectorAll(".imgDiv");
		// console.log(imgDivs);	
		for (var i = 0; i < imgDivs.length; i++) {
			var deleteImg = document.createElement("img");
			deleteImg.setAttribute("src", "../icons/delete.svg");
			deleteImg.style.float = "right";
			deleteImg.style.verticalAlign = "middle";
			deleteImg.style.height = "100%";
			deleteImg.classList.add("deleteImgs");
			imgDivs[i].appendChild(deleteImg);														
			deleteImg.addEventListener("click", function(){
				plugins.splice(this.parentElement.parentElement.parentElement.getAttribute("data-id"), 1);
				curVers.splice(this.parentElement.parentElement.parentElement.getAttribute("data-id"), 1);
				saveStorage();
				addDelImgs();
			}); 
	}	
}

function removeImgs(){
	var imgDivs = document.querySelectorAll(".imgDiv");
	for (var i = 0; i < imgDivs.length; i++) {
		while(imgDivs[i].firstChild){
			imgDivs[i].removeChild(imgDivs[i].firstChild);
		}
	}
}

function loading(parent){
	var circle = document.createElement("div");
	circle.classList.add("sk-fading-circle", "circle");
	var circ1 = document.createElement("div");
	circ1.classList.add("sk-circle1", "sk-circle");
	var circ2 = document.createElement("div");
	circ2.classList.add("sk-circle2", "sk-circle");
	var circ3 = document.createElement("div");
	circ3.classList.add("sk-circle3", "sk-circle");
	var circ4 = document.createElement("div");
	circ4.classList.add("sk-circle4", "sk-circle");
	var circ5 = document.createElement("div");
	circ5.classList.add("sk-circle5", "sk-circle");
	var circ6 = document.createElement("div");
	circ6.classList.add("sk-circle6", "sk-circle");
	var circ7 = document.createElement("div");
	circ7.classList.add("sk-circle7", "sk-circle");
	var circ8 = document.createElement("div");
	circ8.classList.add("sk-circle8", "sk-circle");
	var circ9 = document.createElement("div");
	circ9.classList.add("sk-circle9", "sk-circle");
	var circ10 = document.createElement("div");
	circ10.classList.add("sk-circle10", "sk-circle");
	var circ11 = document.createElement("div");
	circ11.classList.add("sk-circle11", "sk-circle");
	var circ12 = document.createElement("div");
	circ12.classList.add("sk-circle12", "sk-circle");

	circle.appendChild(circ1);
	circle.appendChild(circ2);
	circle.appendChild(circ3);
	circle.appendChild(circ4);
	circle.appendChild(circ5);
	circle.appendChild(circ6);
	circle.appendChild(circ7);
	circle.appendChild(circ8);
	circle.appendChild(circ9);
	circle.appendChild(circ10);
	circle.appendChild(circ11);
	circle.appendChild(circ12);

	parent.appendChild(circle);
}

function checkVers(){
	var curVerDivs = document.querySelectorAll(".insVerDiv");
	var insVerDivs = document.querySelectorAll(".curVerDiv");
	var imgDivs = document.querySelectorAll(".imgDiv");

	for (var i = 0; i < plugins.length; i++) {
		if(curVerDivs[i].innerHTML === insVerDivs[i].innerHTML){
			var goodImg = document.createElement("img");
			goodImg.setAttribute("src", "../icons/good.svg");
			goodImg.classList.add("goodImgs");
			imgDivs[i].appendChild(goodImg);
		}
		else if(curVerDivs[i].innerHTML != insVerDivs[i].innerHTML && curVers[i]){
			console.log("cur", curVers[i]);
			var errorImg = document.createElement("img");
			errorImg.setAttribute("src", "../icons/error.svg");
			errorImg.classList.add("errorImg");
			imgDivs[i].appendChild(errorImg);
		}
	}
}

function toast(text){
	var toast = document.getElementById("snackbar");

    toast.className = "show";
    toast.innerHTML = text;

    setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
}
