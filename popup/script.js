var regex = /<script type='application\/ld\+json'>\s*({\s+"@context": "http:\/\/schema\.org",\s+"@type": "WebApplication",[\s\S]+?)<\/script>/gim;
var forum_plugins = [];
var custom_plugins = [];
var plugins = [forum_plugins,custom_plugins];
var show_forum_plugins = true;

getStorage().then(function(){
	populateMain();
	getCurrentVersions();
});

function convertStorage(){
	return browser.storage.local.get('plugins').then(function(storage) {
		if(storage.plugins){
			let old_version_plugins = [];
			for (let i = 0; i < storage.plugins.length; i++) { 
				let date_options = {year: 'numeric', month: 'long', day: 'numeric'};
				let date = new Date();

				let obj = {
					url: storage.plugins[i].url,
					name: storage.plugins[i].name,
					installed_version: storage.plugins[i].version,
					source: 'forum',
					date_added: date.toLocaleDateString('en-US',date_options),
					date_checked :  '',
					notes: ''
				}
				old_version_plugins.push(obj);
			}		
			forum_plugins = old_version_plugins.slice();
			saveToStorage();
			getStorage().then(function(){
				populateMain();
				getCurrentVersions();
			});
		}
	});	
}

function getStorage(){
	return browser.storage.local.get('plugins_data').then(function(storage) {
		if(storage.plugins_data){
			plugins = storage.plugins_data;
			forum_plugins = plugins[0].slice();
			custom_plugins = plugins[1].slice();
		}
		else{
			convertStorage();
		}
	});
}

function saveToStorage(){
	joinArrays();

	browser.storage.local.set({
		"plugins_data": plugins,
	});
}

function getCurrentVersions(){
	if(show_forum_plugins){
		for (var i = 0; i < forum_plugins.length; i++) {
			let id = getPluginId(forum_plugins[i].url);
			addVersionLoader(id);
			httpGet(forum_plugins[i].url, function(plugin_info){
				let current_version = plugin_info.version;
				// to prevent when user changes lists
				if(show_forum_plugins){
					let current_version_container = document.getElementsByClassName('current_version_container')[id];
					if(current_version_container){
						current_version_container.innerText = current_version;
						forum_plugins[id].current_version = current_version;
					}
					let url = document.getElementById('url_input').value;
					if(plugin_info.url == url){
						let current_version_input = document.getElementById('current_version_input');
						current_version_input.value = plugin_info.version;
					}
					removeVersionLoader(id);
					compareVersions(id);	
				}
			});		
		}
	}
	else{
		for (var i = 0; i < custom_plugins.length; i++) {
			let id = getPluginId(custom_plugins[i].url);
			removeStatusImage(id);
			addStatusImage(id,'update_version');
		}
	}
}

function addVersionLoader(id){
	let status_container = document.getElementsByClassName('status_container');

	let lds_css = document.createElement('div');
	lds_css.classList.add('lds-css','ng-scope');
	let lds_spinner = document.createElement('div');
	lds_spinner.classList.add('lds-spinner');
	let child1 = document.createElement('div');
	let child2 = document.createElement('div');
	let child3 = document.createElement('div');
	let child4 = document.createElement('div');
	let child5 = document.createElement('div');
	let child6 = document.createElement('div');
	let child7 = document.createElement('div');
	let child8 = document.createElement('div');
	let child9 = document.createElement('div');
	let child10 = document.createElement('div');
	let child11 = document.createElement('div');
	let child12 = document.createElement('div');
	let child13 = document.createElement('div');
	let child14 = document.createElement('div');
	let child15 = document.createElement('div');
	
	lds_css.appendChild(lds_spinner);
	lds_spinner.appendChild(child1);
	lds_spinner.appendChild(child2);
	lds_spinner.appendChild(child3);
	lds_spinner.appendChild(child4);
	lds_spinner.appendChild(child5);
	lds_spinner.appendChild(child6);
	lds_spinner.appendChild(child7);
	lds_spinner.appendChild(child8);
	lds_spinner.appendChild(child9);
	lds_spinner.appendChild(child10);
	lds_spinner.appendChild(child11);
	lds_spinner.appendChild(child12);
	lds_spinner.appendChild(child13);
	lds_spinner.appendChild(child14);
	lds_spinner.appendChild(child15);

	status_container[id].appendChild(lds_css);
}

function removeVersionLoader(id){
	let status_container = document.getElementsByClassName('status_container');
	if(status_container){
		while (status_container[id].firstChild) {
			status_container[id].removeChild(status_container[id].firstChild);
		}		
	}
}

function compareVersions(id){
	if (typeof id !== 'undefined') {
		let installed_version_container = document.getElementsByClassName('installed_version_container')[id];
		let current_version_container = document.getElementsByClassName('current_version_container')[id];
		removeStatusImage(id);
		getCurrentTab().then(function(tab){
			if(tab[0].url != 'about:blank'){
				var url = tab[0].url;
				var plugin_url = forum_plugins[id].url;
			}
			else{
				var url = tab[0].title;
				if(show_forum_plugins){
					var plugin_url = forum_plugins[id].url.split('//')[1];
				}
				else{
					var plugin_url = custom_plugins[id].url.split('//')[1];
				}
			}

			if(installed_version_container.innerText == current_version_container.innerText){
				addStatusImage(id,'checkmark');			
			}
			else if(installed_version_container.innerText != current_version_container.innerText && url == plugin_url){
				addStatusImage(id,'update_version');
			}
			else{
				addStatusImage(id,'exclamation_mark');	
			}
		});
	}
	else{
		getCurrentTab().then(function(tab){
			if(show_forum_plugins){
				for (var i = 0; i < forum_plugins.length; i++) {
					if(tab[0].url != 'about:blank'){
						var url = tab[0].url;
					}
					else{
						var url = tab[0].title;
					}
					if(show_forum_plugins){
						var plugin_url = forum_plugins[i].url.split('//')[1];
					}
					let id = getPluginId(forum_plugins[i].url);
					let installed_version_container = document.getElementsByClassName('installed_version_container')[id];
					let current_version_container = document.getElementsByClassName('current_version_container')[id];
					removeStatusImage(id);
					if(installed_version_container.innerText == current_version_container.innerText){
						addStatusImage(id,'checkmark');	
					}
					else if(installed_version_container.innerText != current_version_container.innerText && url == plugin_url){
						addStatusImage(id,'update_version');
					}
					else{
						addStatusImage(id,'exclamation_mark');
					}
				}
			}
			else{
				for (var i = 0; i < custom_plugins.length; i++) {
					let id = getPluginId(custom_plugins[i].url);
					let installed_version_container = document.getElementsByClassName('installed_version_container')[id];
					let current_version_container = document.getElementsByClassName('current_version_container')[id];
					removeStatusImage(id);
					addStatusImage(id,'update_version');
				}
			}		
		});
	}
}

function addStatusImage(id,type){
	let status_container = document.getElementsByClassName('status_container')[id];
	let image = document.createElement("img");
	let helper_span = document.createElement('span')
	switch(type){
		case 'checkmark':
			image.setAttribute("src", "../icons/checkmark.svg");
			break;
		case 'exclamation_mark':
			image.setAttribute("src", "../icons/exclamation_mark.svg");
			break;
		case 'update_version':
			image.setAttribute("src", "../icons/update_version.svg");
			image.classList.add('update_version_image');
			image.addEventListener('click', function(){
				let current_version_container = document.getElementsByClassName('current_version_container')[id];
				let installed_version_container = document.getElementsByClassName('installed_version_container')[id];
				if(show_forum_plugins){
					installed_version_container.innerText = current_version_container.innerText;
					forum_plugins[id].installed_version = current_version_container.innerText;
					removeStatusImage(id);
					saveToStorage();
					compareVersions();
				}
				else{
					let date_options = {year: 'numeric', month: 'long', day: 'numeric'};
					let date = new Date();
					date = date.toLocaleDateString("en-US",date_options);
					current_version_container.innerText = date;
					custom_plugins[id].date_checked = date;
					saveToStorage();
					compareVersions();
				}
			});
			break;
	}
	image.classList.add('status_container_image');
	helper_span.classList.add('helper');
	status_container.appendChild(image);
	status_container.appendChild(helper_span);
}

function removeStatusImage(id){
	let status_container = document.getElementsByClassName('status_container');
	if (typeof id !== 'undefined') {
		if (status_container[id]) {
			while (status_container[id].firstChild) {
				status_container[id].removeChild(status_container[id].firstChild);
			}
		}
	}
	else{
		if(show_forum_plugins){
			for (var i = 0; i < forum_plugins.length; i++) {
				let id = getPluginId(forum_plugins[i].url);
				while (status_container[id].firstChild) {
					status_container[id].removeChild(status_container[id].firstChild);
				}
			}
		}
	}
}


function clearMain(){
	let main = document.getElementById('main');
	while (main.firstChild) {
		main.removeChild(main.firstChild);
	}
}

function populateMain(plugin_array,current_version){
	if (typeof plugin_array !== 'undefined'){
		for (var i = 0; i < plugin_array.length; i++) {
			if(plugin_array[i].current_version){
				addPlugin(plugin_array[i].url,plugin_array[i].name,plugin_array[i].installed_version,plugin_array[i].current_version);
			}
			else if(plugin_array[i].date_checked){
				addPlugin(plugin_array[i].url,plugin_array[i].name,plugin_array[i].installed_version,plugin_array[i].date_checked);	
			}
		}	
	}
	else{
		if(show_forum_plugins){
			for (var i = 0; i < forum_plugins.length; i++) {
				addPlugin(forum_plugins[i].url,forum_plugins[i].name,forum_plugins[i].installed_version,null);
			}
		}
		else{
			for (var i = 0; i < custom_plugins.length; i++) {
				addPlugin(custom_plugins[i].url,custom_plugins[i].name,custom_plugins[i].installed_version,custom_plugins[i].date_checked);	
			}
		}
	}
}

function showOverlayLoader(){
	let loader_container = document.getElementsByClassName('loader_container')[0];
	loader_container.classList.remove('hide');
}

function hideOverlayLoader(){
	let loader_container = document.getElementsByClassName('loader_container')[0];
	loader_container.classList.add('hide');
}

function showOverlayMain(){
	let overlay_main = document.getElementById('overlay_main');
	overlay_main.classList.remove('hide');
}

function hideOverlayMain(){
	let overlay_main = document.getElementById('overlay_main');
	overlay_main.classList.add('hide');	
}

function openOverlay(headline_text){
	let add_overlay = document.getElementsByClassName('add_overlay')[0];
	add_overlay.classList.remove('closed');

	let headline = document.getElementById('headline');
	if(headline_text) headline.innerText = headline_text;	
}

function closeOverlay(){
	let add_overlay = document.getElementsByClassName('add_overlay')[0];
	add_overlay.classList.add('closed');
	hideOverlayLoader();
}

function addOverlayInfo(plugin_object,current_checked_text,button_left,button_right,read_only,delete_button){
	let url_input = document.getElementById('url_input');
	let name_input = document.getElementById('name_input');
	let installed_version_input = document.getElementById('installed_version_input');
	let current_version_input = document.getElementById('current_version_input');
	let current_checked_text_display = document.getElementById('current_checked_text');
	let date_input = document.getElementById('date_input');
	let notes_input = document.getElementById('notes_input');
	let overlay_button_left_container = document.getElementById('overlay_button_left_container');
	let overlay_button_right_container = document.getElementById('overlay_button_right_container');
	let button_placeholder = document.getElementById('button_placeholder');
	let notes_container = document.getElementById('notes_container');
	let delete_entry_button = document.getElementById('delete_entry_button');

	removeOverlayButtons();
	addOverlayButton(button_left,button_right);
	changeInputReadOnly(read_only,false,plugin_object.source);

	if(plugin_object){
		let id = getPluginId(plugin_object.url);
		current_checked_text_display.innerText = current_checked_text;
		if(plugin_object.url) url_input.value = plugin_object.url;
		else url_input.value = ''; 	
		if(plugin_object.name) name_input.value = plugin_object.name;
		else name_input.value = '';
		if(plugin_object.installed_version) installed_version_input.value = plugin_object.installed_version;
		else if(plugin_object.version) installed_version_input.value = plugin_object.version;
		else installed_version_input.value = '';
		if(plugin_object.current_version) current_version_input.value = plugin_object.current_version;
		else if(plugin_object.date_checked) current_version_input.value = plugin_object.date_checked;
		else if(plugin_object.version) current_version_input.value = plugin_object.version;
		else current_version_input.value = document.getElementsByClassName('current_version_container')[id].innerText;
		if(plugin_object.date_added) date_input.value = plugin_object.date_added;
		else date_input.value = '';
		if(plugin_object.notes) notes_input.innerText = plugin_object.notes;
		else notes_input.innerText = '';	
	}

	if(delete_button){
		notes_input.style.maxHeight = '130px';
		notes_container.appendChild(delete_entry_button);
	}
	else{
		notes_input.style.maxHeight = '180px';
		let button_placeholder = document.getElementById('button_placeholder');
		let delete_entry_button = document.getElementById('delete_entry_button');
		button_placeholder.appendChild(delete_entry_button);
	}
}

function addOverlayButton(button_left,button_right){
	switch(button_left){
		case 'cancel_overlay_button':
			let cancel_overlay_button = document.getElementById('cancel_overlay_button');
			cancel_overlay_button.classList.remove('hide');
			overlay_button_left_container.appendChild(cancel_overlay_button);
			cancel_overlay_button.innerText = 'Cancel';
			break;
		case 'close_overlay_button':
			let close_overlay_button = document.getElementById('close_overlay_button');
			close_overlay_button.classList.remove('hide');
			overlay_button_left_container.appendChild(close_overlay_button);
			close_overlay_button.innerText = 'Close';
			break;
		case 'cancel_edit_button':
			let cancel_edit_button = document.getElementById('cancel_edit_button');
			cancel_edit_button.classList.remove('hide');
			overlay_button_left_container.appendChild(cancel_edit_button);
			cancel_edit_button.innerText = 'Cancel';
			break;
	}

	switch(button_right){
		case 'save_overlay_button':
			let save_overlay_button = document.getElementById('save_overlay_button');
			save_overlay_button.classList.remove('hide');
			overlay_button_right_container.appendChild(save_overlay_button);
			save_overlay_button.innerText = 'Save'; 
			break;
		case 'edit_overlay_button':
			let edit_overlay_button = document.getElementById('edit_overlay_button');
			edit_overlay_button.classList.remove('hide');
			overlay_button_right_container.appendChild(edit_overlay_button);
			edit_overlay_button.innerText = 'Edit';
			break;
		case 'save_edit_button':
			let save_edit_button = document.getElementById('save_edit_button');
			save_edit_button.classList.remove('hide');
			overlay_button_right_container.appendChild(save_edit_button);
			save_edit_button.innerText = 'Save'; 
			break;
	}
}

function getCurrentTab() {
	return browser.tabs.query({currentWindow: true, active: true});
}

function removeOverlayButtons(){
	let overlay_button_left_container = document.getElementById('overlay_button_left_container');
	let overlay_button_right_container = document.getElementById('overlay_button_right_container');
	let button_placeholder = document.getElementById('button_placeholder');
	while (overlay_button_left_container.firstChild) {
	    button_placeholder.appendChild(overlay_button_left_container.firstChild);
	}
	while (overlay_button_right_container.firstChild) {
		button_placeholder.appendChild(overlay_button_right_container.firstChild);
	}
}

function httpGet(url, callback){
	let xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() { 
	    if (xmlHttp.readyState == 4 && xmlHttp.status == 200){

			let response = xmlHttp.responseText;

			regex.lastIndex = null;
			let arr = regex.exec(response);
			if(arr == null){
				addCustomPlugin(url);
			}
			else{
				let date_options = {year: 'numeric', month: 'long', day: 'numeric'};
				let date = new Date();


				let obj = {
					url: url,
					name: JSON.parse(arr[1]).name,
					version: JSON.parse(arr[1]).softwareVersion,
					date_added: date.toLocaleDateString("en-US",date_options),
					source: 'forum',
					date_checked :  null,
					notes: null
				}

				callback(obj);
			}
		}
	}
	xmlHttp.open("GET", url, true);
	xmlHttp.onerror = function () {
		addCustomPlugin(url);
    };
    xmlHttp.send(null);
}

function addCustomPlugin(url){
	let date_options = {year: 'numeric', month: 'long', day: 'numeric'};
	let date = new Date();

	let obj = {
		url: url,
		name: null,
		installed_version: null,
		source: 'custom',
		date_added: date.toLocaleDateString('en-US',date_options),
		date_checked :  date.toLocaleDateString('en-US',date_options),
		notes: null
	}

	hideOverlayLoader();
	showOverlayMain();
	addOverlayInfo(obj,'Last time checked','cancel_overlay_button','save_overlay_button',false,false);	
}

let add_button = document.getElementById('add_button_container');

add_button.addEventListener('click', function(){
	removeOverlayButtons();
	openOverlay("New entry");
	getCurrentTab().then(function(current_tab){
		hideOverlayMain();
		showOverlayLoader();
		let tab_url = current_tab[0].url;
		httpGet(tab_url, function(plugin_info){
			hideOverlayLoader();
			showOverlayMain();
			addOverlayInfo(plugin_info,'Current version','cancel_overlay_button','save_overlay_button',false,false);
			changeInputReadOnly(false,true,plugin_info.source);	
		})
	});
});

let refresh_button = document.getElementById('refresh_button_container');
refresh_button.addEventListener('click', function(){
	let current_version_container = document.getElementsByClassName('current_version_container');
	if(show_forum_plugins){
		for (let i = 0; i < plugins.length; i++) {
			if(plugins[i].source == 'forum'){
				let id = getPluginIdSeperated(plugins[i].url);
				current_version_container[id].innerText = '';
			}
		}
		removeStatusImage();
		getCurrentVersions();
	}
})

var close_overlay_button = document.getElementById('close_overlay_button');
close_overlay_button.addEventListener('click', function(){
	closeOverlay();
	removeSnackbar();
});

var edit_overlay_button = document.getElementById('edit_overlay_button');
edit_overlay_button.addEventListener('click', function(){
	let url = document.getElementById('url_input').value;
	let id = getPluginId(url);

	removeOverlayButtons();
	addOverlayButton('cancel_edit_button','save_edit_button');
	if(show_forum_plugins){
		changeInputReadOnly(false,false,forum_plugins[id].source);
	}
	else{
		changeInputReadOnly(false,false,custom_plugins[id].source);
	}
	let name_container = document.getElementById('name_container');
	name_container.style.animation = "blink .5s step-end infinite alternate";

	let button_placeholder = document.getElementById('button_placeholder');
	let delete_entry_button = document.getElementById('delete_entry_button');
	button_placeholder.appendChild(delete_entry_button);

	document.getElementById('notes_input').style.maxHeight = '180px';

	//add color change on hover on overlay
	let overlay_containers = document.getElementsByClassName('overlay_containers');
	let overlay_input_box = document.getElementsByClassName('overlay_input_box');
	let notes_input = document.getElementById('notes_input');
	for (var i = 0; i < overlay_containers.length; i++) {
		overlay_containers[i].classList.add('overlay_containers_hover');
		overlay_input_box[i].classList.add('overlay_input_box_hover');
	}
	notes_input.classList.add('notes_input_hover');
});

var cancel_overlay_button = document.getElementById('cancel_overlay_button');
cancel_overlay_button.addEventListener('click', function(){
	closeOverlay();
	removeSnackbar();
});


let cancel_edit_button = document.getElementById('cancel_edit_button');
cancel_edit_button.addEventListener('click', function(){
	removeOverlayButtons();
	addOverlayButton('close_overlay_button','edit_overlay_button');
	changeInputReadOnly(true,false);
	closeOverlayEditing();
});

let save_overlay_button = document.getElementById('save_overlay_button');
save_overlay_button.addEventListener('click', function(){
	let url = document.getElementById('url_input').value;
	if(pluginExistance(url) == false && checkInputsFilled() == true){
		if (url.includes('forums.x-plane.org/index.php?/files')){
			var source = 'forum';
			var date_checked = '';
			show_forum_plugins = true;
			let forum_button = document.getElementById('forum_button');
			let custom_button = document.getElementById('custom_button');
			custom_button.style.textDecoration="none";
			forum_button.style.textDecoration="underline";
		}
		else{
			var source = "custom";
			var date_checked = document.getElementById('current_version_input').value;
			show_forum_plugins = false;
			let forum_button = document.getElementById('forum_button');
			let custom_button = document.getElementById('custom_button');
			custom_button.style.textDecoration="underline";
			forum_button.style.textDecoration="none"; 		
		} 

		let plugin = {
			url: url,
			name: document.getElementById('name_input').value,
			installed_version: document.getElementById('installed_version_input').value,
			date_added: document.getElementById('date_input').value,
			date_checked : date_checked,
			notes: document.getElementById('notes_input').innerText,
			source: source
		}

		if(source == 'forum'){
			forum_plugins.push(plugin);
		}
		else{
			custom_plugins.push(plugin);
		}

		let current_version = document.getElementById('current_version_input').value;

		closeOverlay();
		removeSnackbar();
		addPlugin(plugin.url,plugin.name,plugin.installed_version,current_version);
		saveToStorage();
		clearMain();
		populateMain();
		getCurrentVersions();	
	}
	else{	
	}
});

let save_edit_button = document.getElementById('save_edit_button');
save_edit_button.addEventListener('click', function(){
	let url = document.getElementById('url_input').value;
	let name_input = document.getElementById('name_input');
	let installed_version_input = document.getElementById('installed_version_input');
	let current_version_input = document.getElementById('current_version_input');

	let notes_input = document.getElementById('notes_input');

	let id = getPluginId(url);
	if(show_forum_plugins){
		forum_plugins[id].name = name_input.value;
		forum_plugins[id].installed_version = installed_version_input.value;
		forum_plugins[id].notes = notes_input.innerText;
	}
	else{
		custom_plugins[id].name = name_input.value;
		custom_plugins[id].installed_version = installed_version_input.value;
		custom_plugins[id].date_checked = current_version_input.value;
		custom_plugins[id].notes = notes_input.innerText;
	}
	saveToStorage();
	let search_box_text = document.getElementById('search_box').value;
	getSearch(search_box_text);
	// clearSearchBox(); MDL+
	// clearMain();
	// populateMain();
	// getCurrentVersions(); MDL-
	removeOverlayButtons();
	changeInputReadOnly(true,false);
	addOverlayButton('close_overlay_button','edit_overlay_button');
	closeOverlayEditing();
	addSnackbar('Successfully edited!');

});

let delete_entry_button = document.getElementById('delete_entry_button');
delete_entry_button.addEventListener('click', function(){
	let url = document.getElementById('url_input').value;
	let main = document.getElementById('main');
	let id = getPluginId(url);
	if(show_forum_plugins){
		if (id > -1) {
			// forum_plugins.splice(id, 1);
			forum_plugins[id].delete = true;
		}		
	}
	else{
		if (id > -1) {
			// custom_plugins.splice(id, 1);
			custom_plugins[id].delete = true;
		}	
	}
	saveToStorage();
	closeOverlay();
	clearMain();
	getStorage().then(function(){
		populateMain();
		getCurrentVersions();
		let search_box_text = document.getElementById('search_box').value;
		// if(search_box_text != ''){
		// }
		getSearch(search_box_text);
	});
});

let cross_image = document.getElementById('cross_image');
cross_image.addEventListener('click', function(){
	removeSnackbar();
});

let forum_button = document.getElementById('forum_button');
forum_button.addEventListener('click', function(){
	if(!show_forum_plugins){
		show_forum_plugins = true;
		clearSearchBox();
		// addVersionLoader();
		getCurrentVersions();
		

		let custom_button = document.getElementById('custom_button');
		custom_button.style.textDecoration="none";
		forum_button.style.textDecoration="underline";
	}
});

let custom_button = document.getElementById('custom_button');
custom_button.addEventListener('click', function(){
	if(show_forum_plugins){
		show_forum_plugins = false;
		clearSearchBox();
		// getCurrentVersions();
		let forum_button = document.getElementById('forum_button');
		custom_button.style.textDecoration="underline";
		forum_button.style.textDecoration="none";
	}
});

let search_box = document.getElementById('search_box');
search_box.addEventListener("input", function(){
	let search_box_text = search_box.value;
	if(search_box_text != ''){
		getSearch(search_box_text);
	}
	else{
		clearSearchBox();
	}
});

function clearSearchBox(){
	let search_box = document.getElementById('search_box');
	search_box.value = '';
	clearMain();
	if(show_forum_plugins){
		forum_plugins = plugins[0].slice();
		populateMain(forum_plugins);
	}
	else{
		custom_plugins = plugins[1].slice();
		populateMain();
	}
	compareVersions();
}

function getSearch(text){
	let search_plugins = [];
	forum_plugins = plugins[0].slice();
	custom_plugins = plugins[1].slice();
	let current_version_container = document.getElementById('current_version_container');
	if(show_forum_plugins){
		for (var i = 0; i < forum_plugins.length; i++) {
			if(forum_plugins[i].name.toLowerCase().includes(text)){
				search_plugins.push(forum_plugins[i]);
			}
		}
		forum_plugins = search_plugins.slice();
		clearMain();
		populateMain(forum_plugins);
		compareVersions();
	}
	else{
		for (var i = 0; i < custom_plugins.length; i++) {
			if(custom_plugins[i].name.toLowerCase().includes(text)){
				search_plugins.push(custom_plugins[i]);
			}
		}
		custom_plugins = search_plugins.slice();
		clearMain();
		populateMain(custom_plugins);
		compareVersions();
	}	
}

function joinArrays(){
	for (var i = 0; i < forum_plugins.length; i++) {
		let found = false;
		for (var j = 0; j < plugins[0].length; j++) {
			if(plugins[0][j].url == forum_plugins[i].url){
				plugins[0][j].url = forum_plugins[i].url;
				plugins[0][j].name = forum_plugins[i].name;
				plugins[0][j].installed_version = forum_plugins[i].installed_version;
				plugins[0][j].source = forum_plugins[i].source;
				plugins[0][j].date_added = forum_plugins[i].date_added;
				plugins[0][j].date_checked = forum_plugins[i].date_checked;
				plugins[0][j].notes = forum_plugins[i].notes;
				found = true;	
				if(forum_plugins[i].delete == true){
					plugins[0].splice(j, 1);
				}
			}
		}
		if(found == false){
			plugins[0].push(forum_plugins[i]);
		}
	}
	for (var i = 0; i < custom_plugins.length; i++) {
		let found = false;
		for (var j = 0; j < plugins[1].length; j++) {
			if(plugins[1][j].url == custom_plugins[i].url){
				plugins[1][j].url = custom_plugins[i].url;
				plugins[1][j].name = custom_plugins[i].name;
				plugins[1][j].installed_version = custom_plugins[i].installed_version;
				plugins[1][j].source = custom_plugins[i].source;
				plugins[1][j].date_added = custom_plugins[i].date_added;
				plugins[1][j].date_checked = custom_plugins[i].date_checked;
				plugins[1][j].notes = custom_plugins[i].notes;
				found = true;
				if(custom_plugins[i].delete == true){
					plugins[1].splice(j, 1);
				}	
			}
		}
		if(found == false){
			plugins[1].push(custom_plugins[i]);
		}
	}
}

function checkInputsFilled(){
	let missingInfo = false;
	let name_input = document.getElementById('name_input');
	let name_container = document.getElementById('name_container');
	let installed_version_input = document.getElementById('installed_version_input');
	let installed_version_container = document.getElementById('installed_version_container');
	let current_version_input = document.getElementById('current_version_input');
	let current_version_container = document.getElementById('current_version_container');

	if(!/\S/.test(name_input.value)){
		missingInfo = true;
		name_input.style.animation = 'blink .5s step-end 8 alternate';
	}
	if(!/\S/.test(installed_version_input.value)){
		missingInfo = true;
		installed_version_input.style.animation = 'blink .5s step-end 8 alternate';
	}
	if(!/\S/.test(current_version_input.value)){
		missingInfo = true;
		current_version_input.style.animation = 'blink .5s step-end 8 alternate';
	}
	setTimeout(function(){
		name_input.style.animation = '';
		installed_version_input.style.animation = '';
		current_version_input.style.animation = '';
	},5000);

	if(missingInfo){
		addSnackbar('Please fill in all needed information');
		return false;
	}
	else{
		return true;
	}
}

function closeOverlayEditing(){
	let notes_container = document.getElementById('notes_container');
	let delete_entry_button = document.getElementById('delete_entry_button');
	notes_container.appendChild(delete_entry_button);

	document.getElementById('notes_input').style.maxHeight = '130px';

	//no color change on hover cause u can't edit
	let overlay_containers = document.getElementsByClassName('overlay_containers');
	let overlay_input_box = document.getElementsByClassName('overlay_input_box');
	let notes_input = document.getElementById('notes_input');
	
	for (var i = 0; i < overlay_containers.length; i++) {
		overlay_containers[i].classList.remove('overlay_containers_hover');
		overlay_input_box[i].classList.remove('overlay_input_box_hover');
	}

	notes_input.classList.remove('notes_input_hover');

	//reset input-boxes to previous if canceled and not saved
	let url = document.getElementById('url_input').value;
	let name_input = document.getElementById('name_input');
	let installed_version_input = document.getElementById('installed_version_input');

	let id = getPluginId(url);
	if(show_forum_plugins){
		name_input = forum_plugins[id].name;
		installed_version_input.value = forum_plugins[id].installed_version;
		notes_input.innerText = forum_plugins[id].notes;	
	}
	else{
		name_input = custom_plugins[id].name;
		installed_version_input.value = custom_plugins[id].installed_version;
		notes_input.innerText = custom_plugins[id].notes;	
	}
}

function pluginExistance(url){
	for (var i = 0; i < plugins.length; i++) {
		for (var j = 0; j < plugins[i].length; j++) {
			if(plugins[i][j].url == url){
				addSnackbar('This plugin is already in your list!');
				return true;
			}
		}
	}
	return false;
}

function addPlugin(url,name,installed_version,current_checked){
	let main = document.getElementById('main');

	let wrapper_all = document.createElement('div');
	let wrapper_left = document.createElement('div');
	let wrapper_right = document.createElement('div');
	let wrapper_topper = document.createElement('div'); 
	let wrapper_footer = document.createElement('div');
	let name_container = document.createElement('div');
	let info_button_container = document.createElement('div'); 
	let open_button_container = document.createElement('div');
	let status_container = document.createElement('div');
	let installed_version_container = document.createElement('div');
	let current_version_container = document.createElement('div');

	wrapper_all.classList.add('wrapper_all');
	wrapper_left.classList.add('wrapper_left');
	wrapper_right.classList.add('wrapper_right');
	name_container.classList.add('name_container', 'plugin_info_container');
	info_button_container.classList.add('info_button_container');
	open_button_container.classList.add('open_button_container');
	status_container.classList.add('status_container');
	installed_version_container.classList.add('installed_version_container', 'plugin_info_container');
	current_version_container.classList.add('current_version_container', 'plugin_info_container');

	wrapper_all.appendChild(wrapper_left);
	wrapper_all.appendChild(wrapper_right);
	wrapper_left.appendChild(wrapper_topper);
	wrapper_left.appendChild(wrapper_footer);
	wrapper_right.appendChild(status_container);
	wrapper_topper.appendChild(name_container);
	wrapper_topper.appendChild(info_button_container);
	wrapper_topper.appendChild(open_button_container);
	wrapper_footer.appendChild(installed_version_container);
	wrapper_footer.appendChild(current_version_container);

	name_container.setAttribute("title", name);

	let helper_span = document.createElement('span')
	helper_span.classList.add('helper');
	open_button_container.appendChild(helper_span);
	info_button_container.appendChild(helper_span);

	let info_button_image = document.createElement('IMG');
	info_button_image.src = '../icons/info_button.svg';
	info_button_image.classList.add('info_button_image', 'plugin_info_container_image');
	info_button_container.appendChild(info_button_image);

	info_button_image.addEventListener('click', function(){
		let id = getPluginId(url);
		removeOverlayButtons();
		hideOverlayLoader();
		openOverlay('Edit Plugin-Info');
		showOverlayMain();
		if(show_forum_plugins){
			let plugin = forum_plugins[id];
			addOverlayInfo(plugin,'Current version','close_overlay_button','edit_overlay_button', true, true);
		}
		else{
			let plugin = custom_plugins[id];
			addOverlayInfo(plugin,'Last time checked','close_overlay_button','edit_overlay_button', true, true);
		}
		
		//no color change on hover when edit mode is off
		let overlay_containers = document.getElementsByClassName('overlay_containers');
		let overlay_input_box = document.getElementsByClassName('overlay_input_box');
		let notes_input = document.getElementById('notes_input');
		for (var i = 0; i < overlay_containers.length; i++) {
			overlay_containers[i].classList.remove('overlay_containers_hover');
			overlay_input_box[i].classList.remove('overlay_input_box_hover');
		}
		notes_input.classList.remove('notes_input_hover');
	});

	let open_button_image = document.createElement('IMG');
	open_button_image.src = '../icons/open_button.svg';
	open_button_image.classList.add('open_button_image', 'plugin_info_container_image');
	open_button_container.appendChild(open_button_image);
	
	open_button_image.addEventListener('click', function(){
		window.open(url,'_blank');
		compareVersions();	
	});

	if(name) name_container.innerText = name;
	if(installed_version) installed_version_container.innerText = installed_version;
	if(current_checked) current_version_container.innerText = current_checked;   

	main.appendChild(wrapper_all);
}

function getPluginId(url){
	for (var i = 0; i < forum_plugins.length; i++) {
		if(url == forum_plugins[i].url){
			return i;
		}
	}
	//without https etc.
	for (var i = 0; i < forum_plugins.length; i++) {
		if(url == forum_plugins[i].url.split('//')[1]){
			return i;
		}
	}

	for (var i = 0; i < custom_plugins.length; i++) {
		if(url == custom_plugins[i].url){
			return i;
		}
	}
	//without https etc.
	for (var i = 0; i < custom_plugins.length; i++) {
		if(url == custom_plugins[i].url.split('//')[1]){
			return i;
		}
	}
}

function changeInputReadOnly(bool,add,source){
	let url_input = document.getElementById('url_input');
	let name_input = document.getElementById('name_input');
	let installed_version_input = document.getElementById('installed_version_input');
	let current_version_input = document.getElementById('current_version_input');
	let date_input = document.getElementById('date_input');
	let notes_input = document.getElementById('notes_input');

	let url_container = document.getElementById('url_container');
	let name_container = document.getElementById('name_container');
	let installed_version_container = document.getElementById('installed_version_container');
	let current_version_container = document.getElementById('current_version_container');
	let date_container = document.getElementById('date_container');

	url_input.style.cursor = 'not-allowed';
	url_container.style.cursor = 'not-allowed';
	date_input.style.cursor = 'not-allowed';
	date_container.style.cursor = 'not-allowed';

	if(add){ //when adding new plugin
		url_input.readOnly = true;
		url_input.style.cursor = 'not-allowed';
		url_container.style.cursor = 'not-allowed';
		name_input.readOnly = false;
		installed_version_input.readOnly = false;
		if(source != 'custom'){
			current_version_input.readOnly = true;
			current_version_input.style.cursor = 'not-allowed';
			current_version_container.style.cursor = 'not-allowed';		
		}
		else{
			current_version_input.readOnly = false;
			current_version_input.style.cursor = 'text';
			current_version_container.style.cursor = 'default';			
		}
		date_input.readOnly = true;
		date_input.style.cursor = 'not-allowed';
		date_container.style.curso = 'not-allowed';
		notes_input.contentEditable = !bool;		
	}
	else{ //when editing
		url_input.readOnly = true;
		name_input.readOnly = bool;
		installed_version_input.readOnly = bool;
		if(source != 'custom'){
			current_version_input.readOnly = true;	
		}
		else{
			current_version_container.style.cursor = 'default';
			current_version_input.readOnly = false;	
		}
		date_input.readOnly = true;
		notes_input.contentEditable = !bool;	
		if(bool == false){
			name_container.style.cursor = 'default';
			installed_version_container.style.cursor = 'default';
		}	
	}

	let overlay_input_box = document.getElementsByClassName('overlay_input_box');
	let overlay_containers = document.getElementsByClassName('overlay_containers');

	if (bool == false) {
		url_input.style.cursor = 'not-allowed';
		name_input.style.cursor = 'text';
		installed_version_input.style.cursor = 'text';
		if(source != 'custom'){
			current_version_input.style.cursor = 'not-allowed';
		}
		else{
			current_version_input.style.cursor = 'text';
		}
		notes_input.style.cursor = 'text';
		date_input.style.cursor = 'not-allowed';
	}
	else{
		for (var i = 0; i < overlay_input_box.length; i++) {
			overlay_input_box[i].style.cursor = 'not-allowed';
			overlay_containers[i].style.cursor = 'not-allowed';
			overlay_input_box[i].readOnly = true;
		}
		notes_input.style.cursor = 'not-allowed';
	}
}

function addSnackbar(text){
	let snackbar = document.getElementById("snackbar");
	let snackbar_text_container = document.getElementById('snackbar_text_container');
	snackbar.classList.remove('remove')
	snackbar.classList.add('show');
	snackbar_text_container.innerText = text;	
}

function removeSnackbar(){
	let xr = document.getElementById("snackbar");
	snackbar.classList.add('remove');
	setTimeout(function(){
		snackbar.classList.remove('show');
	},500);
}