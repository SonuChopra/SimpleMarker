/********************************************************************************************************
Authors Name: Sonu Chopra
Extension Name: SimpleMarker
Created: Summer 2017
********************************************************************************************************/

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	if(localStorage["searching"] != "null"){
		if(changeInfo.status == "complete"){
			chrome.tabs.executeScript({code: "window.find(\""+localStorage["searching"]+"\");"}, function(){
				localStorage["searching"] = "null";
			});
		}
	}
});

var markerAdded = {
	type: "basic",
	title: "A SimpleMarker was added!",
	message:"",
	iconUrl: "logo5_128by128.png"
};

var simpleMarkContextMenu = {
	"id": "simplemark",
	"title": "SimpleMark this page!",
	"contexts": ["all"]
};

chrome.contextMenus.create(simpleMarkContextMenu);

chrome.contextMenus.onClicked.addListener(function(clickData){
	if(clickData.menuItemId == "simplemark"){
		chrome.storage.sync.get(["stored_numOutside", "stored_SMBriefcase"], function(result){
			var tempObj = new Object();
			var selectionOfCurrentPage;
			var currentTabsURL;
			var SMBriefcase = new Array();
			var numOutside;

			if(result["stored_numOutside"] == null)
				numOutside = 0;
			else
				numOutside = Number(result["stored_numOutside"]);
			if(result["stored_SMBriefcase"] == null)
				SMBriefcase == new Array();
			else
				SMBriefcase = result["stored_SMBriefcase"];

			chrome.tabs.executeScript(null, {code: "window.getSelection().toString();"}, function(selection){
				selectionOfCurrentPage = selection[0];

				chrome.tabs.query({"active": true, "lastFocusedWindow": true}, function (tabs){
					currentTabsURL = tabs[0].url;

					if(selectionOfCurrentPage == ""){
						tempObj.name = currentTabsURL;
						tempObj.search = null;
					}
					else{
						tempObj.name = selectionOfCurrentPage;
						tempObj.search = selectionOfCurrentPage;
					}
					tempObj.url = currentTabsURL;
					SMBriefcase.splice(numOutside, 0, tempObj);
					numOutside ++;
					chrome.storage.sync.set({"stored_numOutside":numOutside, "stored_SMBriefcase":SMBriefcase}, function(result){
						console.log(numOutside + "Briefcase: ",  SMBriefcase);
					});

				});

			});

		});

		chrome.notifications.create(markerAdded);	
	}
});