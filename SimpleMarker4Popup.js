/********************************************************************************************************
Authors Name: Sonu Chopra
Extension Name: SimpleMarker
Created: Summer 2017
********************************************************************************************************/

var deleteIsActivated = false;
var outsideEditIsActivated = true;
var insideEditIsActivated = true;
var folderEditIsActivated = true;

var currentTabsURL;
var selectionOfCurrentPage;

var numOfFolders;
var numOutside;
var SMBriefcase = new Array();

localStorage["searching"] = null;

chrome.tabs.query({"active": true, "lastFocusedWindow": true}, function(tabs){
        currentTabsURL = tabs[0].url;
});

chrome.tabs.executeScript(null, {code: "window.getSelection().toString();"}, function(selection){
    selectionOfCurrentPage = selection[0];
});

chrome.storage.sync.get(["stored_numOutside", "stored_numOfFolders", "stored_SMBriefcase"], function(result){
    numOutside = result["stored_numOutside"];
    numOfFolders = result["stored_numOfFolders"];
    if(result["stored_SMBriefcase"] != null)
        SMBriefcase = result["stored_SMBriefcase"];
    initilizeOutside();
    initilizeInside();
    document.getElementById("addMarker").addEventListener("click", addMarker);
    document.getElementById("addFolder").addEventListener("click", addFolder);
    document.getElementById("trashcan").addEventListener("click", trashActivate);
    document.getElementById("trashcan").addEventListener("drop", trashThisData);
    document.getElementById("trashcan").addEventListener("dragover", allowDrop);
});

function save(){
    chrome.storage.sync.set({"stored_numOutside":numOutside, "stored_numOfFolders":numOfFolders, "stored_SMBriefcase":SMBriefcase});
}

function saveBriefcase(){
    chrome.storage.sync.set({"stored_SMBriefcase":SMBriefcase});
}

function initilizeOutside(){
    if(numOutside == null)
        numOutside = 0;
    else{
        for(var i=0; i<numOutside; i++){
            var temp;
            var text;

            temp = document.createElement("li");
            temp.id = "outMark"+i;
            document.getElementById("outsideUl").appendChild(temp);

            temp = document.createElement("a");
            text = document.createTextNode(SMBriefcase[i].name);
            temp.appendChild(text);
            temp.id = "outLink"+i;
            temp.className = "outsideLinks";
            temp.href = SMBriefcase[i].url;
            temp.draggable = true;
            temp.target ="_blank";
            temp.title = "open bookmark";
            document.getElementById("outMark"+i).appendChild(temp);

            temp = document.createElement("img");
            temp.id = "outEdiBut"+i;
            temp.className = "outsideEditButton";
            temp.src ="editButton.png";
            temp.title = "edit bookmark";
            document.getElementById("outMark"+i).appendChild(temp);

            temp = document.createElement("img");
            temp.id = "outDelBut"+i;
            temp.className = "outsideDeleteButton";
            temp.src ="deleteButton.png";
            temp.title = "delete bookmark";
            document.getElementById("outMark"+i).appendChild(temp);

            document.getElementById("outLink"+i).addEventListener("click", searchTwo);
            document.getElementById("outEdiBut"+i).addEventListener("click", editOutsideMarker);
            document.getElementById("outDelBut"+i).addEventListener("click", deleteOutsideMarker);
            document.getElementById("outLink"+i).addEventListener("dragstart", dragThisData);
        }
    }
}

function addMarker(){
    var temp;
    var text;
    var tempObj = new Object();

    document.getElementById("addMarker").removeEventListener("click", addMarker);
    document.getElementById("addMarker").style.filter = "grayscale(100%)";
    document.getElementById("addMarker").title = "Disabled: page is already bookmarked";

    if(selectionOfCurrentPage == "" || selectionOfCurrentPage == null){
        tempObj.name = currentTabsURL;
        tempObj.search = null;
    }
    else{
        tempObj.name = selectionOfCurrentPage;
        tempObj.search = selectionOfCurrentPage;
    }

    tempObj.url = currentTabsURL;

    temp = document.createElement("li");
    temp.id = "outMark"+numOutside;
    document.getElementById("outsideUl").appendChild(temp);

    temp = document.createElement("a");
    text = document.createTextNode(tempObj.name);
    temp.appendChild(text);
    temp.id = "outLink"+numOutside;
    temp.className = "outsideLinks";
    temp.href = currentTabsURL;
    temp.draggable = true;
    temp.target="_blank";
    temp.title = "open bookmark";
    document.getElementById("outMark"+numOutside).appendChild(temp);

    temp = document.createElement("img");
    temp.id = "outEdiBut"+numOutside;
    temp.className = "outsideEditButton";
    temp.src ="editButton.png";
    temp.title = "edit bookmark";
    document.getElementById("outMark"+numOutside).appendChild(temp);

    temp = document.createElement("img");
    temp.id = "outDelBut"+numOutside;
    temp.className = "outsideDeleteButton";
    temp.src ="deleteButton.png";
    if(deleteIsActivated == true)
        temp.style.visibility = "visible";
    temp.title = "delete bookmark";
    document.getElementById("outMark"+numOutside).appendChild(temp);

    document.getElementById("outLink"+numOutside).addEventListener("click", searchTwo);
    document.getElementById("outEdiBut"+numOutside).addEventListener("click", editOutsideMarker);
    document.getElementById("outDelBut"+numOutside).addEventListener("click", deleteOutsideMarker);
    document.getElementById("outLink"+numOutside).addEventListener("dragstart", dragThisData);

    SMBriefcase.splice(numOutside, 0, tempObj);
    numOutside++;
    save();
}

function deleteOutsideMarker(){
    var deleteThisOne = Number(this.id.substring(9));

    document.getElementById("outMark" + deleteThisOne).remove();

    for(var i=deleteThisOne; i<(numOutside-1); i++){
        document.getElementById("outMark"+(i+1)).id = "outMark"+i;
        document.getElementById("outLink"+(i+1)).id = "outLink"+i;
        document.getElementById("outEdiBut"+(i+1)).id = "outEdiBut"+i;
        document.getElementById("outDelBut"+(i+1)).id = "outDelBut"+i;
    }
    SMBriefcase.splice(deleteThisOne,1);
    numOutside--;
    save();
}

function editOutsideMarker(){
    var editThisOne = Number(this.id.substring(9));
    var text;
    var temp;

    if(deleteIsActivated == true)
        trashActivate();

    document.getElementById("outLink"+editThisOne).remove();
    document.getElementById("outEdiBut"+editThisOne).remove();
    document.getElementById("outDelBut"+editThisOne).remove();

    temp = document.createElement("textarea");
    temp.id = "tempTextArea"+editThisOne;
    temp.className = "editInput";
    temp.value = SMBriefcase[editThisOne].name;
    temp.rows = (SMBriefcase[editThisOne].name.length/60)+1;
    document.getElementById("outMark"+editThisOne).appendChild(temp);
	temp.focus();
	temp.select();

    temp = document.createElement("img");
    temp.id = "tempSave"+editThisOne;
    temp.className = "outsideSaveButton";
    temp.src = "saveButton.png";
    temp.title = "save";
    document.getElementById("outMark"+editThisOne).appendChild(temp);

    temp = document.createElement("img");
    temp.id = "tempCancel"+editThisOne;
    temp.className = "outsideCancelButton";
    temp.src = "cancelButton.png";
    temp.title = "cancel";
    document.getElementById("outMark"+editThisOne).appendChild(temp);

    document.getElementById("tempSave"+editThisOne).addEventListener("click", saveOutsideEdit);
    document.getElementById("tempCancel"+editThisOne).addEventListener("click", cancelOutsideEdit);
}

function saveOutsideEdit(evt){
    var saveThisOne = Number(evt.target.id.substring(8));
    var text;
    var temp;

    SMBriefcase[saveThisOne].name=document.getElementById("tempTextArea"+saveThisOne).value;

    document.getElementById("tempTextArea"+saveThisOne).remove();
    document.getElementById("tempSave"+saveThisOne).remove();
    document.getElementById("tempCancel"+saveThisOne).remove();

    temp = document.createElement("a");
    text = document.createTextNode(SMBriefcase[saveThisOne].name);
    temp.appendChild(text);
    temp.id = "outLink"+saveThisOne;
    temp.className = "outsideLinks";
    temp.href = SMBriefcase[saveThisOne].url;
    temp.draggable = true;
    temp.target = "_blank";
    temp.title = "open bookmark";
    document.getElementById("outMark"+saveThisOne).appendChild(temp);

    temp = document.createElement("img");
    temp.id = "outEdiBut"+saveThisOne;
    temp.className = "outsideEditButton";
    temp.src ="editButton.png";
    temp.title = "edit bookmark";
    document.getElementById("outMark"+saveThisOne).appendChild(temp);

    temp = document.createElement("img");
    temp.id = "outDelBut"+saveThisOne;
    temp.className = "outsideDeleteButton";
    temp.src ="deleteButton.png";
    temp.title = "delete bookmark";
    document.getElementById("outMark"+saveThisOne).appendChild(temp);

    document.getElementById("outLink"+saveThisOne).addEventListener("click", searchTwo);
    document.getElementById("outEdiBut"+saveThisOne).addEventListener("click", editOutsideMarker);
    document.getElementById("outDelBut"+saveThisOne).addEventListener("click", deleteOutsideMarker);
    document.getElementById("outLink"+saveThisOne).addEventListener("dragstart", dragThisData);

    saveBriefcase();
}

function cancelOutsideEdit(evt){
    var cancelThisOne = Number(evt.target.id.substring(10));
    var temp;
    var text;

    document.getElementById("tempTextArea"+cancelThisOne).remove();
    document.getElementById("tempSave"+cancelThisOne).remove();
    document.getElementById("tempCancel"+cancelThisOne).remove();

    temp = document.createElement("a");
    text = document.createTextNode(SMBriefcase[cancelThisOne].name);
    temp.appendChild(text);
    temp.id = "outLink"+cancelThisOne;
    temp.className = "outsideLinks";
    temp.href = SMBriefcase[cancelThisOne].url;
    temp.draggable = true;
    temp.targe = "_blank";
    temp.title = "open bookmark";
    document.getElementById("outMark"+cancelThisOne).appendChild(temp);

    temp = document.createElement("img");
    temp.id = "outEdiBut"+cancelThisOne;
    temp.className = "outsideEditButton";
    temp.src ="editButton.png";
    temp.title = "edit bookmark";
    document.getElementById("outMark"+cancelThisOne).appendChild(temp);

    temp = document.createElement("img");
    temp.id = "outDelBut"+cancelThisOne;
    temp.className = "outsideDeleteButton";
    temp.src ="deleteButton.png";
    temp.title = "delete bookmark";
    document.getElementById("outMark"+cancelThisOne).appendChild(temp);

    document.getElementById("outLink"+cancelThisOne).addEventListener("click", searchTwo);
    document.getElementById("outEdiBut"+cancelThisOne).addEventListener("click", editOutsideMarker);
    document.getElementById("outDelBut"+cancelThisOne).addEventListener("click", deleteOutsideMarker);
    document.getElementById("outLink"+cancelThisOne).addEventListener("dragstart", dragThisData);
}

function searchTwo(){
    var searchThisOne = Number(this.id.substring(7));
    localStorage["searching"] = SMBriefcase[searchThisOne].search;
}

function initilizeInside(){
    if(numOfFolders == null)
        numOfFolders = 0;
    else{
        for(var i=0; i<numOfFolders; i++){
            var temp;
            var text;

            temp = document.createElement("li");
            temp.id = "folderLi"+i;
            temp.className = "folderList";
            document.getElementById("insideUl").appendChild(temp);

            temp = document.createElement("button");
            text = document.createTextNode(SMBriefcase[i+numOutside].name);
            temp.appendChild(text);
            temp.id = "butFolder"+i;
            temp.className = "buttonFolder";
            temp.draggable = true;
            temp.title = "openFolder";
            document.getElementById("folderLi"+i).appendChild(temp);

            temp = document.createElement("img");
            temp.id = "iconFolde"+i;
            temp.className = "iconFolder";
            temp.src ="folderIconClosed.png";
            temp.title = "open folder";
            document.getElementById("folderLi"+i).appendChild(temp);

            temp = document.createElement("img");
            temp.id = "ediFolder"+i;
            temp.className = "editFolder";
            temp.src ="editButton.png";
            temp.title = "edit folder";
            document.getElementById("folderLi"+i).appendChild(temp);

            temp = document.createElement("img");
            temp.id = "delFolder"+i;
            temp.className = "deleteFolder";
            temp.src ="deleteButton.png";
            temp.title = "delete folder";
            document.getElementById("folderLi"+i).appendChild(temp);

            if(SMBriefcase[i+numOutside].isOpen == true){
                var folder = SMBriefcase[i+numOutside];
                var simpleMark;

                temp = document.createElement("ul");
                temp.id = "insidefolderUl"+i;
                document.getElementById("folderLi"+i).appendChild(temp);

                document.getElementById("iconFolde"+i).src = "folderIconOpen.png";

                for(var j=0; j<SMBriefcase[i+numOutside].numOfMarks; j++){
                    simpleMark = folder.storedMarkers[j];

                    temp = document.createElement("li");
                    temp.id = "inMark"+i+"_"+j;
                    temp.className = "insideMarkerList";
                    document.getElementById("insidefolderUl"+i).appendChild(temp);

                    temp = document.createElement("a");
                    text = document.createTextNode(simpleMark.name);
                    temp.appendChild(text);
                    temp.id = "inLink"+i+"_"+j;
                    temp.className = "insideLinks";
                    temp.href = simpleMark.url;
                    temp.draggable = true;
                    temp.target="_blank";
                    temp.title = "open bookmark";
                    document.getElementById("inMark"+i+"_"+j).appendChild(temp);

                    temp = document.createElement("img");
                    temp.id = "edibut"+i+"_"+j;
                    temp.className = "insideEditButton";
                    temp.src ="editButton.png";
                    temp.title = "edit bookmark";
                    document.getElementById("inMark"+i+"_"+j).appendChild(temp);

                    temp = document.createElement("img");
                    temp.id = "delbut"+i+"_"+j;
                    temp.className = "insideDeleteButton";
                    temp.src ="deleteButton.png";
                    temp.title = "delete bookmark";
                    document.getElementById("inMark"+i+"_"+j).appendChild(temp);

                    document.getElementById("inLink"+i+"_"+j).addEventListener("click", searchOne);
                    document.getElementById("edibut"+i+"_"+j).addEventListener("click", editInsideMarker);
                    document.getElementById("delbut"+i+"_"+j).addEventListener("click", deleteInsideMarker);
                    document.getElementById("inLink"+i+"_"+j).addEventListener("dragstart", dragThisData);

                }
            }
            document.getElementById("iconFolde"+i).addEventListener("click", openFolder);
            document.getElementById("butFolder"+i).addEventListener("click", openFolder);
            document.getElementById("ediFolder"+i).addEventListener("click", editFolder);
            document.getElementById("delFolder"+i).addEventListener("click", deleteFolder);
            document.getElementById("butFolder"+i).addEventListener("drop", dropThisData);
            document.getElementById("butFolder"+i).addEventListener("dragover", allowDrop);
            document.getElementById("butFolder"+i).addEventListener("dragstart", dragThisData);
        }
    }
}

function addFolder(){
    var temp;
    var text;

    document.getElementById("addFolder").removeEventListener("click", addFolder);
    document.getElementById("addFolder").title = "Disabled: complete adding folder";

    temp = document.createElement("li");
    temp.id = "folderLi"+numOfFolders;
    temp.className = "folderList";
    document.getElementById("insideUl").appendChild(temp);

    temp = document.createElement("input");
    temp.id = "tempInp"+numOfFolders;
    temp.className = "inputFolderCreate";
    document.getElementById("folderLi"+numOfFolders).appendChild(temp);
	temp.focus();
	temp.select();

    temp = document.createElement("button");
    text = document.createTextNode("+");
    temp.appendChild(text);
    temp.id = "tempAdd"+numOfFolders;
    temp.className = "createFolderButton";
    temp.title = "create";
    document.getElementById("folderLi"+numOfFolders).appendChild(temp);

    temp = document.createElement("button");
    text = document.createTextNode("X");
    temp.appendChild(text);
    temp.id = "tempCancel"+numOfFolders;
    temp.className = "cancelFolderButton";
    temp.title = "cancel";
    document.getElementById("folderLi"+numOfFolders).appendChild(temp);

    document.getElementById("tempAdd"+numOfFolders).addEventListener("click", createFolder);
    document.getElementById("tempCancel"+numOfFolders).addEventListener("click", cancelFolder);

}

function createFolder(){
    var text;
    var temp;
    var tempFolder = {"name":document.getElementById("tempInp"+numOfFolders).value, "isOpen":false, "numOfMarks":0, "storedMarkers":new Array()};
    SMBriefcase.push(tempFolder);

    document.getElementById("tempInp"+numOfFolders).remove();
    document.getElementById("tempAdd"+numOfFolders).remove();
    document.getElementById("tempCancel"+numOfFolders).remove();

    temp = document.createElement("img");
    temp.id = "iconFolde"+numOfFolders;
    temp.className = "iconFolder";
    temp.src = "folderIconClosed.png";
    document.getElementById("folderLi"+numOfFolders).appendChild(temp);

    temp = document.createElement("button");
    text = document.createTextNode(tempFolder.name);
    temp.appendChild(text);
    temp.id = "butFolder"+numOfFolders;
    temp.className = "buttonFolder";
    temp.draggable = true;
    temp.title = "open folder";
    document.getElementById("folderLi"+numOfFolders).appendChild(temp);

    temp = document.createElement("img");
    temp.id = "ediFolder"+numOfFolders;
    temp.className = "editFolder";
    temp.src = "editButton.png";
    temp.title = "edit folder";
    document.getElementById("folderLi"+numOfFolders).appendChild(temp);

    temp = document.createElement("img");
    temp.id = "delFolder"+numOfFolders;
    temp.className = "deleteFolder";
    if(deleteIsActivated == true)
        temp.style.visibility = "visible";
    temp.src = "deleteButton.png";
    temp.title = "delete folder";
    document.getElementById("folderLi"+numOfFolders).appendChild(temp);

    document.getElementById("iconFolde"+numOfFolders).addEventListener("click", openFolder);
    document.getElementById("butFolder"+numOfFolders).addEventListener("click", openFolder);
    document.getElementById("ediFolder"+numOfFolders).addEventListener("click", editFolder);
    document.getElementById("delFolder"+numOfFolders).addEventListener("click", deleteFolder);
    document.getElementById("butFolder"+numOfFolders).addEventListener("drop", dropThisData);
    document.getElementById("butFolder"+numOfFolders).addEventListener("dragover", allowDrop);
    document.getElementById("butFolder"+numOfFolders).addEventListener("dragstart", dragThisData);

    numOfFolders++;
    save();

    document.getElementById("addFolder").disabled = false;
    document.getElementById("addFolder").addEventListener("click", addFolder);
    document.getElementById("addFolder").title = "add folder";

}

function cancelFolder(){
    document.getElementById("folderLi"+numOfFolders).remove();
    document.getElementById("addFolder").disabled = false;
    document.getElementById("addFolder").addEventListener("click", addFolder);
    document.getElementById("addFolder").title = "add folder";
}

function deleteFolder(){
    var deleteThisOne = Number(this.id.substring(9));

    document.getElementById("folderLi"+deleteThisOne).remove();
    for(var i = deleteThisOne; i<(numOfFolders-1); i++){
        document.getElementById("iconFolde"+(i+1)).id = "iconFolde"+i;
        document.getElementById("folderLi"+(i+1)).id = "folderLi"+i;
        document.getElementById("butFolder"+(i+1)).id = "butFolder"+i;
        document.getElementById("ediFolder"+(i+1)).id = "ediFolder"+i;
        document.getElementById("delFolder"+(i+1)).id = "delFolder"+i;
    }
    SMBriefcase.splice((deleteThisOne+numOutside), 1);
    numOfFolders--;
    save();
}

function editFolder(){
    var editThisFolder = Number(this.id.substring(9));

    var temp;
    var text;

    document.getElementById("butFolder"+editThisFolder).remove();
    document.getElementById("ediFolder"+editThisFolder).remove();
    document.getElementById("delFolder"+editThisFolder).remove();
    document.getElementById("iconFolde"+editThisFolder).style.visibility = "hidden";

    temp = document.createElement("input");
    temp.value = SMBriefcase[editThisFolder+numOutside].name;
    temp.id = "tempInp"+editThisFolder;
    temp.className = "inputFolder";
    document.getElementById("folderLi"+editThisFolder).appendChild(temp);
	temp.focus();
	temp.select();

    temp = document.createElement("img");
    temp.id = "tempSave"+editThisFolder;
    temp.className = "saveEditFolder";
    temp.src = "saveButton.png";
    temp.title = "save";
    document.getElementById("folderLi"+editThisFolder).appendChild(temp);

    temp = document.createElement("img");
    temp.id = "tempCancel"+editThisFolder;
    temp.className = "cancelEditFolder";
    temp.src = "cancelButton.png";
    temp.title = "cancel";
    document.getElementById("folderLi"+editThisFolder).appendChild(temp);

    if(SMBriefcase[editThisFolder+numOutside].isOpen == true){
        temp = document.getElementById("insidefolderUl"+editThisFolder);
        document.getElementById("folderLi"+editThisFolder).appendChild(temp);
    }

    document.getElementById("tempSave"+editThisFolder).addEventListener("click", saveEditFolder);
    document.getElementById("tempCancel"+editThisFolder).addEventListener("click", cancelEditFolder);
}

function saveEditFolder(evt){
    var editThisFolder = Number(evt.target.id.substring(8));

    var text;
    var temp;
    SMBriefcase[editThisFolder+numOutside].name = document.getElementById("tempInp"+editThisFolder).value;

    document.getElementById("tempInp"+editThisFolder).remove();
    document.getElementById("tempSave"+editThisFolder).remove();
    document.getElementById("tempCancel"+editThisFolder).remove();

    temp = document.createElement("button");
    text = document.createTextNode(SMBriefcase[editThisFolder+numOutside].name);
    temp.appendChild(text);
    temp.id = "butFolder" + editThisFolder;
    temp.className = "buttonFolder";
    temp.draggable = true;
    temp.title = "open folder";
    document.getElementById("folderLi"+editThisFolder).appendChild(temp);

    temp = document.createElement("img");
    temp.id = "ediFolder"+editThisFolder;
    temp.className = "editFolder";
    temp.src ="editButton.png";
    temp.title = "edit folder";
    document.getElementById("folderLi"+editThisFolder).appendChild(temp);

    temp = document.createElement("img");
    temp.id = "delFolder"+editThisFolder;
    temp.className = "deleteFolder";
    temp.src ="deleteButton.png";
    if(deleteIsActivated == true)
        temp.style.visibility = "visible";
    temp.title = "delete folder";
    document.getElementById("folderLi"+editThisFolder).appendChild(temp);

    if(SMBriefcase[editThisFolder+numOutside].isOpen == true){
        temp = document.getElementById("insidefolderUl"+editThisFolder);
        document.getElementById("folderLi"+editThisFolder).appendChild(temp);
    }

    document.getElementById("iconFolde"+editThisFolder).style.visibility = "visible";

    document.getElementById("butFolder"+editThisFolder).addEventListener("click", openFolder);
    document.getElementById("ediFolder"+editThisFolder).addEventListener("click", editFolder);
    document.getElementById("delFolder"+editThisFolder).addEventListener("click", deleteFolder);
    document.getElementById("butFolder"+editThisFolder).addEventListener("drop", dropThisData);
    document.getElementById("butFolder"+editThisFolder).addEventListener("dragover", allowDrop);
    document.getElementById("butFolder"+editThisFolder).addEventListener("dragstart", dragThisData);

    saveBriefcase();
}

function cancelEditFolder(evt){
    var cancelThisFolder = Number(evt.target.id.substring(10));

    var text;
    var temp;

    document.getElementById("tempInp"+cancelThisFolder).remove();
    document.getElementById("tempSave"+cancelThisFolder).remove();
    document.getElementById("tempCancel"+cancelThisFolder).remove();

    var temp = document.createElement("button");
    text = document.createTextNode(SMBriefcase[cancelThisFolder+numOutside].name);
    temp.appendChild(text);
    temp.id = "butFolder" + cancelThisFolder;
    temp.className = "buttonFolder";
    temp.draggable = true;
    temp.title = "open folder";
    document.getElementById("folderLi"+cancelThisFolder).appendChild(temp);

    temp = document.createElement("img");
    temp.id = "ediFolder"+cancelThisFolder;
    temp.className = "editFolder";
    temp.src = "editButton.png";
    temp.title = "edit folder";
    document.getElementById("folderLi"+cancelThisFolder).appendChild(temp);

    temp = document.createElement("img");
    temp.id = "delFolder"+cancelThisFolder;
    temp.className = "deleteFolder";
    temp.src = "deleteButton.png";
    if(deleteIsActivated == true)
        temp.style.visibility = "visible";
    temp.title = "delete folder";
    document.getElementById("folderLi"+cancelThisFolder).appendChild(temp);

    if(SMBriefcase[cancelThisFolder+numOutside].isOpen == true){
        temp = document.getElementById("insidefolderUl"+cancelThisFolder);
        document.getElementById("folderLi"+cancelThisFolder).appendChild(temp);
    }

    document.getElementById("iconFolde"+cancelThisFolder).style.visibility = "visible";

    document.getElementById("butFolder"+cancelThisFolder).addEventListener("click", openFolder);
    document.getElementById("ediFolder"+cancelThisFolder).addEventListener("click", editFolder);
    document.getElementById("delFolder"+cancelThisFolder).addEventListener("click", deleteFolder);
    document.getElementById("butFolder"+cancelThisFolder).addEventListener("drop", dropThisData);
    document.getElementById("butFolder"+cancelThisFolder).addEventListener("dragover", allowDrop);
    document.getElementById("butFolder"+cancelThisFolder).addEventListener("dragstart", dragThisData);
}

function openFolder(){
    var openThisOne = Number(this.id.substring(9));
    if(SMBriefcase[openThisOne+numOutside].isOpen == false){
        var temp;
        var text;

        temp = document.createElement("ul");
        temp.id = "insidefolderUl"+openThisOne;
        document.getElementById("folderLi"+openThisOne).appendChild(temp);

        document.getElementById("iconFolde"+openThisOne).src = "folderIconOpen.png";

        var folder = SMBriefcase[openThisOne+numOutside];
        var simpleMark;
        for(var i=0; i<SMBriefcase[openThisOne+numOutside].numOfMarks; i++){
            simpleMark = folder.storedMarkers[i];

            temp = document.createElement("li");
            temp.id = "inMark"+openThisOne+"_"+i;
            temp.className = "insideMarkerList";
            document.getElementById("insidefolderUl"+openThisOne).appendChild(temp);

            temp = document.createElement("a");
            text = document.createTextNode(simpleMark.name);
            temp.appendChild(text);
            temp.id = "inLink"+openThisOne+"_"+i;
            temp.className = "insideLinks";
            temp.href = simpleMark.url;
            temp.draggable = true;
            temp.target = "_blank";
            temp.title = "open bookmark";
            document.getElementById("inMark"+openThisOne+"_"+i).appendChild(temp);

            temp = document.createElement("img");
            temp.id = "edibut"+openThisOne+"_"+i;
            temp.className = "insideEditButton";
            temp.src = "editButton.png";
            temp.title = "edit bookmark";
            document.getElementById("inMark"+openThisOne+"_"+i).appendChild(temp);

            temp = document.createElement("img");
            temp.id = "delbut"+openThisOne+"_"+i;
            temp.className = "insideDeleteButton";
            temp.style.visibility = "hidden"
            temp.src = "deleteButton.png";
            temp.title = "delete bookmark";
            document.getElementById("inMark"+openThisOne+"_"+i).appendChild(temp);

            document.getElementById("inLink"+openThisOne+"_"+i).addEventListener("click", searchOne);
            document.getElementById("edibut"+openThisOne+"_"+i).addEventListener("click", editInsideMarker);
            document.getElementById("delbut"+openThisOne+"_"+i).addEventListener("click", deleteInsideMarker);
            document.getElementById("inLink"+openThisOne+"_"+i).addEventListener("dragstart", dragThisData);
        }
        SMBriefcase[openThisOne+numOutside].isOpen = true;
    }
    else{
        document.getElementById("iconFolde"+openThisOne).src = "folderIconClosed.png";
        document.getElementById("insidefolderUl"+openThisOne).remove();
        SMBriefcase[openThisOne+numOutside].isOpen = false;
    }
    saveBriefcase();
}


function deleteInsideMarker(){
    var thisId = this.id;
    var folderNum= Number(thisId.substring(6,thisId.indexOf("_")));
    var markerNum= Number(thisId.substring((thisId.indexOf("_")+1)));
    var deleteThisOne = thisId.substring(6);

    document.getElementById("inMark" + deleteThisOne).remove();
    for(var i=markerNum; i<(SMBriefcase[folderNum+numOutside].numOfMarks-1); i++){
        document.getElementById("inMark"+folderNum+"_"+(i+1)).id = "inMark"+folderNum+"_"+i;
        document.getElementById("inLink"+folderNum+"_"+(i+1)).id = "inLink"+folderNum+"_"+i;
        document.getElementById("edibut"+folderNum+"_"+(i+1)).id = "edibut"+folderNum+"_"+i;
        document.getElementById("delbut"+folderNum+"_"+(i+1)).id = "delbut"+folderNum+"_"+i;
    }
    SMBriefcase[folderNum+numOutside].storedMarkers.splice(markerNum, 1);
    SMBriefcase[folderNum+numOutside].numOfMarks--;
    save();
}


function editInsideMarker(ev){
    var thisId = this.id;
    var folderNum= Number(thisId.substring(6,thisId.indexOf("_")));
    var markerNum= Number(thisId.substring((thisId.indexOf("_")+1)));
    var editThisMarker = thisId.substring(6);
    var temp;
    var text;

    if(deleteIsActivated == true)
        trashActivate();

    document.getElementById("inLink"+editThisMarker).remove();
    document.getElementById("edibut"+editThisMarker).remove();
    document.getElementById("delbut"+editThisMarker).remove();

    temp = document.createElement("textarea");
    temp.id = "tempTextArea"+editThisMarker;
    temp.className = "editInsideInput";
    temp.rows = (SMBriefcase[folderNum+numOutside].storedMarkers[markerNum].name.length/60)+1;
    temp.value = SMBriefcase[folderNum+numOutside].storedMarkers[markerNum].name;
    document.getElementById("inMark"+editThisMarker).appendChild(temp);
	temp.focus();
	temp.select();

    temp = document.createElement("img");
    temp.id = "tempSave"+editThisMarker;
    temp.className = "insideSaveButton";
    temp.src ="saveButton.png";
    temp.title = "save";
    document.getElementById("inMark"+editThisMarker).appendChild(temp);

    temp = document.createElement("img");
    temp.id = "tempCancel"+editThisMarker;
    temp.className = "insideCancelButton";
    temp.src ="cancelButton.png";
    temp.title = "cancel";
    document.getElementById("inMark"+editThisMarker).appendChild(temp);

    document.getElementById("tempSave"+editThisMarker).addEventListener("click", saveInsideEdit);
    document.getElementById("tempCancel"+editThisMarker).addEventListener("click", cancelInsideEdit);
}

function saveInsideEdit(evt){
    var thisId = evt.target.id;
    var folderNum= Number(thisId.substring(8,thisId.indexOf("_")));
    var markerNum= Number(thisId.substring((thisId.indexOf("_")+1)));
    var editThisMarker = thisId.substring(8);
    var text;
    var temp;

    SMBriefcase[folderNum+numOutside].storedMarkers[markerNum].name = document.getElementById("tempTextArea"+editThisMarker).value;

    document.getElementById("tempTextArea"+editThisMarker).remove();
    document.getElementById("tempSave"+editThisMarker).remove();
    document.getElementById("tempCancel"+editThisMarker).remove();

    temp = document.createElement("a");
    text = document.createTextNode(SMBriefcase[folderNum+numOutside].storedMarkers[markerNum].name);
    temp.appendChild(text);
    temp.id = "inLink"+editThisMarker;
    temp.className = "insideLinks";
    temp.href = SMBriefcase[folderNum+numOutside].storedMarkers[markerNum].url;
    temp.draggable = true;
    temp.target = "_blank";
    temp.title = "open bookmark";
    document.getElementById("inMark"+editThisMarker).appendChild(temp);

    temp = document.createElement("img");
    temp.id = "edibut"+editThisMarker;
    temp.className = "insideEditButton";
    temp.src = "editButton.png";
    temp.title = "edit bookmark";
    document.getElementById("inMark"+editThisMarker).appendChild(temp);

    temp = document.createElement("img");
    temp.id = "delbut"+editThisMarker;
    temp.className = "insideDeleteButton";
    if(deleteIsActivated == true)
        temp.style.visibility = "visible";
    temp.src = "deleteButton.png";
    temp.title = "delete bookmark";
    document.getElementById("inMark"+editThisMarker).appendChild(temp);

    document.getElementById("inLink"+editThisMarker).addEventListener("click", searchOne);
    document.getElementById("edibut"+editThisMarker).addEventListener("click", editInsideMarker);
    document.getElementById("delbut"+editThisMarker).addEventListener("click", deleteInsideMarker);
    document.getElementById("inLink"+editThisMarker).addEventListener("dragstart", dragThisData);

    saveBriefcase();
}

function cancelInsideEdit(evt){

    var thisId = evt.target.id;
    var folderNum= Number(thisId.substring(10,thisId.indexOf("_")));
    var markerNum= Number(thisId.substring((thisId.indexOf("_")+1)));
    var editThisMarker = thisId.substring(10);
    var text;
    var temp;

    document.getElementById("tempTextArea"+editThisMarker).remove();
    document.getElementById("tempSave"+editThisMarker).remove();
    document.getElementById("tempCancel"+editThisMarker).remove();

    temp = document.createElement("a");
    text = document.createTextNode(SMBriefcase[folderNum+numOutside].storedMarkers[markerNum].name);
    temp.appendChild(text);
    temp.id = "inLink"+editThisMarker;
    temp.className = "insideLinks";
    temp.href = SMBriefcase[folderNum+numOutside].storedMarkers[markerNum].url;
    temp.target="_blank";
    temp.draggable = true;
    temp.title = "open bookmark";
    document.getElementById("inMark"+editThisMarker).appendChild(temp);

    temp = document.createElement("img");
    temp.id = "edibut"+editThisMarker;
    temp.className = "insideEditButton";
    temp.src = "editButton.png";
    temp.title = "edit bookmark";
    document.getElementById("inMark"+editThisMarker).appendChild(temp);

    temp = document.createElement("img");
    temp.id = "delbut"+editThisMarker;
    temp.className = "insideDeleteButton";
    if(deleteIsActivated == true)
        temp.style.visibility = "visible";
    temp.src = "deleteButton.png";
    temp.title = "delete bookmark";
    document.getElementById("inMark"+editThisMarker).appendChild(temp);

    document.getElementById("inLink"+editThisMarker).addEventListener("click", searchOne);
    document.getElementById("edibut"+editThisMarker).addEventListener("click", editInsideMarker);
    document.getElementById("delbut"+editThisMarker).addEventListener("click", deleteInsideMarker);
    document.getElementById("inLink"+editThisMarker).addEventListener("dragstart", dragThisData);
}

function searchOne(){
    var thisId = this.id;
    var folder = Number(thisId.substring(6,thisId.indexOf("_")));
    var marker = Number(thisId.substring((thisId.indexOf("_")+1)));
    var searchThisOne = thisId.substring(6);
    localStorage["linkClicked"] = 1;
    localStorage["searching"] = SMBriefcase[folder+numOutside].storedMarkers[marker].search;
}

function dragThisData(ev){
    ev.dataTransfer.setData("text", ev.target.id);
}

function allowDrop(ev){
    ev.preventDefault();
}

function trashActivate(){
    var db0 = document.getElementsByClassName("outsideDeleteButton");
    var db1 = document.getElementsByClassName("deleteFolder");
    var db2 = document.getElementsByClassName("insideDeleteButton");
    if(deleteIsActivated == false){
        for(var i=0;i<db0.length; i++)
            db0[i].style.visibility = "visible";
        for(var i=0;i<db1.length; i++)
            db1[i].style.visibility = "visible";
        for(var i=0;i<db2.length; i++)
            db2[i].style.visibility = "visible";
        deleteIsActivated = true;
    }
    else{
        for(var i=0;i<db0.length; i++)
            db0[i].style.visibility = "hidden";
        for(var i=0;i<db1.length; i++)
            db1[i].style.visibility = "hidden";
        for(var i=0;i<db2.length; i++)
            db2[i].style.visibility = "hidden";
        deleteIsActivated = false;
    }
}

function dropThisData(ev){
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var temp = data.substring(0, 3);
    var tooThisFolder = Number(ev.target.id.substring(9));
    console.log(data);


    if(temp == "out"){
        var dragThisMark = Number(data.substring(7));

        document.getElementById("outMark"+dragThisMark).remove();

        for(var i=dragThisMark; i<(numOutside-1); i++){
            document.getElementById("outMark"+(i+1)).id = "outMark"+i;
            document.getElementById("outLink"+(i+1)).id = "outLink"+i;
            document.getElementById("outEdiBut"+(i+1)).id = "outEdiBut"+i;
            document.getElementById("outDelBut"+(i+1)).id = "outDelBut"+i;
        }

        SMBriefcase[tooThisFolder+numOutside].storedMarkers.push(SMBriefcase[dragThisMark]);
        SMBriefcase[tooThisFolder+numOutside].numOfMarks++;
        SMBriefcase.splice(dragThisMark,1);
        numOutside--;

        if(SMBriefcase[tooThisFolder+numOutside].isOpen == true){
            var temp;
            var text;
            var num = SMBriefcase[tooThisFolder+numOutside].numOfMarks-1;
            var currObj = SMBriefcase[tooThisFolder+numOutside].storedMarkers[Number(num)];

            temp = document.createElement("li");
            temp.id = "inMark"+tooThisFolder+"_"+num;
            temp.className = "insideMarkerList";
            document.getElementById("insidefolderUl"+tooThisFolder).appendChild(temp);

            temp = document.createElement("a");
            text = document.createTextNode(currObj.name);
            temp.appendChild(text);
            temp.id = "inLink"+tooThisFolder+"_"+num;
            temp.className = "insideLinks";
            temp.href = currObj.url;
            temp.target="_blank";
            temp.draggable = true;
            temp.title = "open mark";
            document.getElementById("inMark"+tooThisFolder+"_"+num).appendChild(temp);

            temp = document.createElement("img");
            temp.id = "edibut"+tooThisFolder+"_"+num;
            temp.className = "insideEditButton";
            temp.src ="editButton.png";
            temp.title = "edit bookmark";
            document.getElementById("inMark"+tooThisFolder+"_"+num).appendChild(temp);

            temp = document.createElement("img");
            temp.id = "delbut"+tooThisFolder+"_"+num;
            temp.className = "insideDeleteButton";
            if(deleteIsActivated == true)
                temp.style.visibility = "visible"
            temp.src ="deleteButton.png";
            temp.title = "delete bookmark";
            document.getElementById("inMark"+tooThisFolder+"_"+num).appendChild(temp);

            document.getElementById("inLink"+tooThisFolder+"_"+num).addEventListener("click", searchOne);
            document.getElementById("edibut"+tooThisFolder+"_"+num).addEventListener("click", editInsideMarker);
            document.getElementById("delbut"+tooThisFolder+"_"+num).addEventListener("click", deleteInsideMarker);
            document.getElementById("inLink"+tooThisFolder+"_"+num).addEventListener("dragstart", dragThisData);

        }
    }
    else if(temp == "inL"){
        var folder = Number(data.substring(6,data.indexOf("_")));
        var marker = Number(data.substring((data.indexOf("_")+1)));
        var moveThisOne = data.substring(6);
        var temp;
        var text;
        var num = SMBriefcase[tooThisFolder+numOutside].numOfMarks;


        document.getElementById("inMark"+moveThisOne).remove();
        for(var i=marker; i<(SMBriefcase[folder+numOutside].numOfMarks-1); i++){
            document.getElementById("inMark"+folder+"_"+(i+1)).id = "inMark"+folder+"_"+i;
            document.getElementById("inLink"+folder+"_"+(i+1)).id = "inLink"+folder+"_"+i;
            document.getElementById("edibut"+folder+"_"+(i+1)).id = "edibut"+folder+"_"+i;
            document.getElementById("delbut"+folder+"_"+(i+1)).id = "delbut"+folder+"_"+i;
        }
        SMBriefcase[tooThisFolder+numOutside].storedMarkers.push(SMBriefcase[folder+numOutside].storedMarkers[marker]);
        SMBriefcase[folder+numOutside].numOfMarks--;
        SMBriefcase[tooThisFolder+numOutside].numOfMarks++;
        SMBriefcase[folder+numOutside].storedMarkers.splice(marker,1);

        if(SMBriefcase[tooThisFolder+numOutside].isOpen == true){

            temp = document.createElement("li");
            temp.id = "inMark"+tooThisFolder+"_"+num;
            temp.className = "insideMarkerList";
            document.getElementById("insidefolderUl"+tooThisFolder).appendChild(temp);

            temp = document.createElement("a");
            text = document.createTextNode(SMBriefcase[tooThisFolder+numOutside].storedMarkers[num].name);
            temp.appendChild(text);
            temp.id = "inLink"+tooThisFolder+"_"+num;
            temp.className = "insideLinks";
            temp.href = SMBriefcase[tooThisFolder+numOutside].storedMarkers[num].url;
            temp.draggable = true;
            temp.target="_blank";
            temp.title = "open bookmark";
            document.getElementById("inMark"+tooThisFolder+"_"+num).appendChild(temp);

            temp = document.createElement("img");
            temp.id = "edibut"+tooThisFolder+"_"+num;
            temp.className = "insideEditButton";
            temp.src ="editButton.png";
            temp.title = "edit bookmark";
            document.getElementById("inMark"+tooThisFolder+"_"+num).appendChild(temp);

            temp = document.createElement("img");
            temp.id = "delbut"+tooThisFolder+"_"+num;
            temp.className = "insideDeleteButton";
            if(deleteIsActivated == true)
                temp.style.visibility = "visible"
            temp.src ="deleteButton.png";
            temp.title = "delete bookmark";
            document.getElementById("inMark"+tooThisFolder+"_"+num).appendChild(temp);

            document.getElementById("inLink"+tooThisFolder+"_"+num).addEventListener("click", searchOne);
            document.getElementById("edibut"+tooThisFolder+"_"+num).addEventListener("click", editInsideMarker);
            document.getElementById("delbut"+tooThisFolder+"_"+num).addEventListener("click", deleteInsideMarker);
            document.getElementById("inLink"+tooThisFolder+"_"+num).addEventListener("dragstart", dragThisData);
        }
    }
    save();

}

function trashThisData(ev){
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var type = data.substring(0,5);
    var deleteThisOne;

    if(type == "butFo"){
        deleteThisOne=Number(data.substring(9));
        document.getElementById("folderLi"+deleteThisOne).remove();
        for(var i =(deleteThisOne); i<(numOfFolders-1); i++){
            document.getElementById("iconFolde"+(i+1)).id = "iconFolde"+i;
            document.getElementById("folderLi"+(i+1)).id = "folderLi"+i;
            document.getElementById("butFolder"+(i+1)).id = "butFolder"+i;
            document.getElementById("ediFolder"+(i+1)).id = "ediFolder"+i;
            document.getElementById("delFolder"+(i+1)).id = "delFolder"+i;
        }
        SMBriefcase.splice(deleteThisOne+numOutside, 1);
        numOfFolders--;
        save();
    }
    else if(type == "inLin"){
        deleteThisOne=data.substring(6);
        var thisFolder=Number(data.substring(6,data.indexOf("_")));
        var thisMarker=Number(data.substring((data.indexOf("_")+1)));

        document.getElementById("inMark" + deleteThisOne).remove();
        for(var i=thisMarker; i<(SMBriefcase[thisFolder+numOutside].numOfMarks-1); i++){
            document.getElementById("inMark"+thisFolder+"_"+(i+1)).id = "inMark"+thisFolder+"_"+i;
            document.getElementById("inLink"+thisFolder+"_"+(i+1)).id = "inLink"+thisFolder+"_"+i;
            document.getElementById("edibut"+thisFolder+"_"+(i+1)).id = "edibut"+thisFolder+"_"+i;
            document.getElementById("delbut"+thisFolder+"_"+(i+1)).id = "delbut"+thisFolder+"_"+i;
        }
        SMBriefcase[thisFolder+numOutside].storedMarkers.splice(thisMarker, 1);
        SMBriefcase[thisFolder+numOutside].numOfMarks--;
        save();
    }
    else if(type == "outLi"){
        deleteThisOne=Number(data.substring(7));
        document.getElementById("outMark" + deleteThisOne).remove();

        for(var i=deleteThisOne; i<(numOutside-1); i++){
            document.getElementById("outMark"+(i+1)).id = "outMark"+i;
            document.getElementById("outLink"+(i+1)).id = "outLink"+i;
            document.getElementById("outEdiBut"+(i+1)).id = "outEdiBut"+i;
            document.getElementById("outDelBut"+(i+1)).id = "outDelBut"+i;
        }
        SMBriefcase.splice(deleteThisOne,1);
        numOutside--;
        save();
    }
}





































