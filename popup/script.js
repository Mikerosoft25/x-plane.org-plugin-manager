var regex = /<script type='application\/ld\+json'>\n({\s+"@context": "http:\/\/schema\.org",\s+"@type": "WebApplication",[\s\S]+?)<\/script>/gim;
var plugins = [];
var curVers = [];
var pluginsTemp = [];
var curVersTemp = [];

getStorage().then(function(){
	pluginsTemp = plugins.slice();
	curVersTemp = curVers.slice();
	populateDivs(pluginsTemp, curVersTemp);
	getCurrentVersions();

	for (var i = 0; i < plugins.length; i++) {
		checkVers(i);
	}
});

function getStorage(){
	return browser.storage.local.get("plugins").then(function(storage) {
		if(storage.plugins){
			plugins = storage.plugins;
			pluginsTemp = plugins.slice();
		}
	});
}

function saveStorage(){
	for (var i = 0; i < plugins.length; i++) {
		plugins[i].id = i;
	}

	browser.storage.local.set({
			"plugins": plugins,
		});

	getStorage();
	curVersTemp = curVers.slice();
	populateDivs(pluginsTemp, curVersTemp);
}

function httpGet(url, callback){
	let xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", url, true);
	xmlHttp.onreadystatechange = function () {
		if (xmlHttp.readyState != 4) return;

		var response = xmlHttp.responseText;

		regex.lastIndex = null;
		var arr = regex.exec(response);

		if(!arr) {
			toast("Something went wrong!");
		}	

		var obj = {
			url: url,
			name: JSON.parse(arr[1]).name,
			version: JSON.parse(arr[1]).softwareVersion,
			date: new Date(JSON.parse(arr[1]).dateModified),
			id: plugins.length
		}

		callback(obj);
	};
	xmlHttp.send();
}

var addButton = document.getElementById('addDiv');

if(addButton){
	addButton.addEventListener("click", function() {
		getTabId().then(function(url) {
			toast("Adding plugin to list...");
			httpGet(url, function(obj) {
				if(!checkExists(obj)){
					plugins.push(obj);
					curVers[plugins.length-1] = obj.version;
					saveStorage();
					addDiv(obj, curVers[plugins.length-1]);
					getCurrentVersions();	
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

function populateDivs(plugins, curVers){
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

		
		wrapper.setAttribute("data-id", plugins[i].id);

		wrapper.classList.add("wrapper");
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
		nameDiv.innerText = name;

		insVerDiv.innerText = plugins[i].version;

		if(curVers.length > 0){
			if (typeof curVers[i] != 'undefined') {
				curVerDiv.innerText = curVers[i];
			}
		}
		
		var URL = plugins[i].url;

		nameDiv.addEventListener("click", function(){
			window.open(plugins[this.parentElement.parentElement.getAttribute("data-id")].url);
		});
		

		if(plugins.length >= 12){
			document.body.style.overflow = "scroll";
			document.body.style.overflowX = "hidden";
		}

	}
	if(showDelImgs){
		removeImgs();
		addDelImgs();
	}
}

function addDiv(plugin, curVersion){
	var main = document.getElementById("main");

	var wrapper = document.createElement("div");
	var topper = document.createElement("div");
	var footer = document.createElement("div");
	var nameDiv = document.createElement("div");
	var imgDiv = document.createElement("div");
	var insVerDiv = document.createElement("div");
	var curVerDiv = document.createElement("div");
	
	wrapper.setAttribute("data-id", plugin.id);

	wrapper.classList.add("wrapper");
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

	var name = plugin.name;
	if(name.length > 40){
		name = name.slice(0,40) + "...";
	}
	nameDiv.innerText = name;

	insVerDiv.innerText = plugin.version;

	if(curVers.length > 0){
		if (typeof curVersion != 'undefined') {
			curVerDiv.innerText = curVersion;
		}
	}
	
	var URL = plugin.url;
	nameDiv.addEventListener("click", function(){
		window.open(plugins[this.parentElement.parentElement.getAttribute("data-id")].url);
	});
		

	if(plugins.length >= 12){
		document.body.style.overflow = "scroll";
		document.body.style.overflowX = "hidden";
	}
}

function updateDiv(name, insVer, curVer, id){
	var divs = document.querySelectorAll(".wrapper");
	var nameDiv = divs[id].children[0].children[0];
	var imgDiv = divs[id].children[0].children[1];
	var insVerDiv = divs[id].children[1].children[0];
	var curVerDiv = divs[id].children[1].children[1];

	nameDiv.innerText = name;
	insVerDiv.innerText = insVer;
	curVerDiv.innerText = curVer;
	imgDiv.innerText = "";
	checkVers(id);
	if (showDelImgs) {
		addDelImgs();
	}
}

var refreshButton = document.getElementById('refreshDiv');

if(refreshButton){
	refreshButton.addEventListener("click", function() {
		getCurrentVersions();
	});
}

function getCurrentVersions(){

	var imgDivs = document.querySelectorAll(".imgDiv");
	removeImgs();

	for (let i = 0; i < plugins.length; i++) {
		loading(imgDivs[i]);
		httpGet(plugins[i].url, function(obj) {	
			curVers[i] = obj.version;

			updateDiv(plugins[i].name, plugins[i].version, curVers[i], i);
		});
	}
	curVersTemp = curVers.slice();	
}

var editButton = document.getElementById('editDiv');
var toggle = true;
var showDelImgs = false;

if(editButton){
	editButton.addEventListener("click", function(){
		removeImgs();
		if(toggle){
			addDelImgs();
			var editImg = document.getElementById("editImg");
			editImg.setAttribute("src", "../icons/done.svg");
			toggle = false;
			showDelImgs = true;
		}
		else{
			removeImgs();
			var editImg = document.getElementById("editImg");
			editImg.setAttribute("src", "../icons/edit.svg");
			toggle = true;
			showDelImgs = false;
			// getCurrentVersions();
			for (var i = 0; i < plugins.length; i++) {
				checkVers(i);
			}
		}
	});
}

var input = document.getElementById('inputField');

if(input){
	input.addEventListener("input", function(){
		var inputText = input.value;
		getSearch(inputText);
		pluginsTemp = plugins.slice();
		curVersTemp = curVers.slice();
	});	
}

function getSearch(input){
	var plugArr = [];
	var verArr = [];
	for (var i = 0; i < plugins.length; i++) {
		if(plugins[i].name.toLowerCase().includes(input)){
			plugArr.push(plugins[i]);
			verArr.push(curVers[i]);
		}
	}
	pluginsTemp = plugArr.slice();
	curVersTemp = verArr.slice();
	populateDivs(pluginsTemp, curVersTemp);
	if(!showDelImgs){
		for (var i = 0; i < plugins.length; i++) {
			checkVers(i);
		}		
	}
}

function addDelImgs(){
	var imgDivs = document.querySelectorAll(".imgDiv");
	var input = document.getElementById('inputField');

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

			curVersTemp.splice(this.parentElement.parentElement.parentElement.getAttribute("data-id"), 1);
			pluginsTemp.splice(this.parentElement.parentElement.parentElement.getAttribute("data-id"), 1);

			saveStorage();
			getSearch(input.value);
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

function checkVers(id){
	var divs = document.querySelectorAll(".wrapper");
	if(divs[id]){
		var imgDiv = divs[id].children[0].children[1];
		var insVerDiv = divs[id].children[1].children[0];
		var curVerDiv = divs[id].children[1].children[1];

		if(insVerDiv.innerText === curVerDiv.innerText){
			var goodImg = document.createElement("img");
			goodImg.setAttribute("src", "../icons/good.svg");
			goodImg.classList.add("goodImgs");
			imgDiv.appendChild(goodImg);				
		}
		else if(insVerDiv.innerText != curVerDiv.innerText && curVers[id]){
			var errorImg = document.createElement("img");
			errorImg.setAttribute("src", "../icons/error.svg");
			errorImg.classList.add("errorImg");
			imgDiv.appendChild(errorImg);
		}		
	}
}

function toast(text){
	var toast = document.getElementById("snackbar");

    toast.className = "show";
    toast.innerText = text;

    setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
}
