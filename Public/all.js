let dbObject = {};

const toggleView = document.getElementById("toggleView");
toggleView.addEventListener("click", event => {
  if (toggleView.textContent == "Edit") {
    let code2 = window.prompt("Enter Admin Passcode", "1234");
    if (code2 === "pppp") {
      toggleView.textContent = "Main";
      document.getElementById("masterView").className = "displayClass";
      document.getElementById("editView").className = "";
      document.getElementById("onOffSelect").className = "displayClass";
    } else {
      window.alert("That was not correct");
    }
  } else {
    toggleView.textContent = "Edit";
    document.getElementById("masterView").className = "";
    document.getElementById("editView").className = "displayClass";
    document.getElementById("onOffSelect").className = "";
  }
});

(async function loadSelectForEdit() {
  const response = await fetch("/sciNames");
  const json = await response.json();
  loadOp(json);
  dbObject = json;
})();

(async function loadAllPictures() {
  let dBdata = await dataFind();
  dBdata.sort(function (a, b) {
    var textA = a.name.toLowerCase();
    var textB = b.name.toLowerCase();
    return textA < textB ? -1 : textA > textB ? 1 : 0;
  });
  makeDom(dBdata);
})();

const getKingdom = document.getElementById("selectKingdom");
getKingdom.addEventListener("change", event => {
  let strUser = selectKingdom.options[selectKingdom.selectedIndex].text;
  hidePictures(strUser);
});

function hidePictures(strUser) {
  const hidden = document.getElementsByClassName("sp_picturesDiv");
  //This part hides the pictures and puts them back
  for (let i = 0; i < hidden.length; i++) {
    let regex = RegExp(strUser);

    if (
      regex.test(document.getElementById(hidden[i].id).className) == true ||
      strUser == "Plant and Animal"
    ) {
      document.getElementById(hidden[i].id).className = document
        .getElementById(hidden[i].id)
        .className.replace(/(?:^|\s)displayClass(?!\S)/g, "");
    } else {
      document.getElementById(hidden[i].id).className += " displayClass";
    }
  }
}

async function dataFind() {
  const api_url = "/dataFind";
  const dbData = await fetch(api_url);
  const json = await dbData.json();
  const arrayofData = Object.values(json);
  return arrayofData;
}

function makeDom(input) {
  const myDiv = document.getElementById("myDiv");
  const inputArr = input;
  for (let i = 0; i < inputArr.length; i++) {
    const attributeString =
      "inlineBlock" + " " + "sp_picturesDiv" + " " + inputArr[i].kingdom;

    if (inputArr[i].license == undefined) {
      inputArr[i].attrLicense = "---";
    }

    const root = document.createElement("div");
    const elemImg = document.createElement("img");
    const elemName = document.createElement("p");
    const elemCommonName = document.createElement("p");
    const artist = document.createElement("p");
    const info = document.createElement("p");
    info.textContent = "Additional Info:\r\n" + inputArr[i].descriptionText;
    info.setAttribute("class", "showInfoText");
    info.setAttribute("onclick", "");

    elemImg.setAttribute("src", "https://" + inputArr[i].imageURL.substring(1));
    elemImg.setAttribute("class", "pictureOfOrg");
    elemImg.setAttribute("name", i);
    elemImg.setAttribute("Alt", "picture of " + inputArr[i].name);
    elemImg.frameSearchName = inputArr[i].name;

    artist.setAttribute("class", "attri");
    root.id = "picture" + i;
    elemName.textContent = inputArr[i].name;
    if (inputArr[i].name == inputArr[i].commonName) {} else {
      elemCommonName.textContent = inputArr[i].commonName;
    }
    if (inputArr[i].artist == undefined) {
      artist.textContent = "No Artist Listed ";
    } else {
      artist.textContent =
        "Image By: " + inputArr[i].artist.substring(0, 28) + " - ";
    }

    root.setAttribute("class", attributeString);
    root.appendChild(elemImg);
    root.appendChild(artist);
    if (
      inputArr[i].license == "Public domain" ||
      inputArr[i].license == "No restrictions" ||
      inputArr[i].license == "---"
    ) {
      const license = document.createElement("span");
      license.setAttribute("class", "attri");
      license.textContent = inputArr[i].license;
      artist.appendChild(license);
    } else {
      const a = document.createElement("a");
      a.setAttribute("href", inputArr[i].licenseURL);
      a.textContent = inputArr[i].license;
      a.setAttribute("class", "attri");
      artist.appendChild(a);
    }

    if (inputArr[i].descriptionText != undefined) {
      root.appendChild(info);
    }
    root.appendChild(elemCommonName);
    root.appendChild(elemName);

    myDiv.appendChild(root);
    sleep("4");
  }
}
//sleep is here to slow down the
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if (new Date().getTime() - start > milliseconds) {
      break;
    }
  }
}

///below here is the edit code

function loadOp(json) {
  json.sort(function (a, b) {
    var textA = a.name.toLowerCase();
    var textB = b.name.toLowerCase();
    return textA < textB ? -1 : textA > textB ? 1 : 0;
  });
  const selects = json;
  const nameSelects = document.getElementById("nameSelect");
  for (let i = 0; i < selects.length; i++) {
    let option = document.createElement("option");
    option.value = selects[i].name;
    option.text = selects[i].name;
    nameSelects.appendChild(option);
  }
  renderSelects(selects);
}

function renderSelects(dataObj) {
  const nameSelector = document.getElementById("nameSelect");
  nameSelector.addEventListener("change", event => {
    let g = dataObj[nameSelector.selectedIndex];
    fillPage(g);

    fillAttr(g);
  });
}
const submitPictureURL = document.getElementById("submitPictureURL");
submitPictureURL.addEventListener("click", async event => {
  const nameSelector = document.getElementById("nameSelect").value;
  const pictureURL = document.getElementById("pictureURLinput").value;
  //let g = (dataObj[nameSelector.selectedIndex]);
  let updateImageURL = {
    name: nameSelector,
    imageURL: pictureURL
  };
  const response = await updateSend(updateImageURL);
  dbObject[document.getElementById("nameSelect").selectedIndex].imageURL =
    updateImageURL.imageURL;
  document.getElementById("pictureURLinput").value = "";
  document.getElementById("pictureURL").textContent = response;
});

const submitArtist = document.getElementById("submitArtist");
submitArtist.addEventListener("click", async event => {
  const nameSelector = document.getElementById("nameSelect").value;
  const artist = document.getElementById("artistInput").value;
  //let g = (dataObj[nameSelector.selectedIndex]);
  let updateArtist = {
    name: nameSelector,
    artist: artist
  };
  const response = await updateSend(updateArtist);
  dbObject[document.getElementById("nameSelect").selectedIndex].artist =
    updateArtist.artist;
  document.getElementById("artistInput").value = "";
  document.getElementById("artistName").textContent = response;
});

const submitCommonName = document.getElementById("submitCommmonName");
submitCommonName.addEventListener("click", async event => {
  const nameSelector = document.getElementById("nameSelect").value;
  const commonName = document.getElementById("commonNameInput").value;
  //let g = (dataObj[nameSelector.selectedIndex]);
  let updateCommonName = {
    name: nameSelector,
    commonName: commonName
  };
  const response = await updateSend(updateCommonName);
  dbObject[document.getElementById("nameSelect").selectedIndex].commonName =
    updateCommonName.commonName;
  document.getElementById("commonNameInput").value = "";
  document.getElementById("commonName").textContent = response;
});

const submitText = document.getElementById("submitText");
submitText.addEventListener("click", async event => {
  const nameSelector = document.getElementById("nameSelect").value;
  const text = document.getElementById("textArea").value;
  //let g = (dataObj[nameSelector.selectedIndex]);
  let updateDescriptionText = {
    name: nameSelector,
    descriptionText: text
  };

  const response = await updateSend(updateDescriptionText);
  dbObject[
    document.getElementById("nameSelect").selectedIndex
  ].descriptionText = response;
  document.getElementById("textArea").value = response;

});

const scrapebutton = document.getElementById("scrape");
scrapebutton.addEventListener("click", event => {
  scrapeOne();
});

async function scrapeOne() {
  const dataObj = {};
  dataObj.name = document.getElementById("sciname").value;
  let picture = await scrape(dataObj);
  dataObj.imageURL = picture.imageURL;
  dataObj.commonName = picture.commonName;
  let returnedDataObj = await imageAttributes(dataObj);

  fillPage(dataObj);
  fillAttr(returnedDataObj);
}

async function scrape(dataObj) {
  const name = dataObj.name;
  const api_url = "/getWiki";
  data = {
    scientificName: name
  };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  };
  const response = await fetch(api_url, options);
  return response.json();
}

function fillPage(dataObj) {
  const scienName = document.getElementById("scienName");
  scienName.textContent = dataObj.name;

  const commonName = document.getElementById("commonName");
  commonName.textContent = dataObj.commonName;

  const elemImg = document.getElementById("picture");
  elemImg.setAttribute("src", "https://" + dataObj.imageURL.substring(2));
  elemImg.frameSearchName = dataObj.name;

  const pictureURL = document.getElementById("pictureURL");
  pictureURL.textContent = dataObj.imageURL;

  const descriptionText = document.getElementById("textArea");
  if (dataObj.hasOwnProperty("descriptionText")) {
    descriptionText.value = dataObj.descriptionText;
  } else {
    descriptionText.value = "write something";
  }
}

async function imageAttributes(dataObj) {
  const regexuse = /([^/]*[^/\d])\d*\.(jpg|JPG|png|jpeg|GIF|gif|PNG)/;
  let imageJPGName = dataObj.imageURL.substring(2).match(regexuse)[0];
  const imageInfoURL =
    "https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=extmetadata&titles=File:" +
    imageJPGName +
    "&format=json";

  const api_url = "/getAttr";
  data = {
    apiURL: imageInfoURL
  };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  };
  const response = await fetch(api_url, options);
  const json = await response.json();
  let attribData = imageAttr(json);
  dataObj.artist = attribData.author;
  dataObj.license = attribData.license;
  dataObj.licenseURL = attribData.licenseUrl;
  return dataObj;
}

function imageAttr(json) {
  let regexmine = /(?!><)>(.*)(?=<)/;
  let attrObj = {};

  const attrData = json;
  let pagenum = Object.keys(json.query.pages);
  let licenseShort;
  //  if (attrData.hasOwnProperty('extmetadata')) {
  if (
    attrData.query.pages[pagenum].imageinfo[0].extmetadata.LicenseShortName ==
    undefined
  ) {
    licenseShort = "None Listed";
  } else {
    licenseShort =
      attrData.query.pages[pagenum].imageinfo[0].extmetadata.LicenseShortName
      .value;
  }

  let licenseURL;

  if (
    attrData.query.pages[pagenum].imageinfo[0].extmetadata.LicenseUrl ==
    undefined
  ) {
    licenseURL = "None";
  } else {
    licenseURL =
      attrData.query.pages[pagenum].imageinfo[0].extmetadata.LicenseUrl.value;
  }
  let author;
  if (
    attrData.query.pages[pagenum].imageinfo[0].extmetadata.Artist == undefined
  ) {
    author = "none listed";
  } else {
    let e = attrData.query.pages[pagenum].imageinfo[0].extmetadata.Artist.value;
    if (e.match(regexmine) == null) {
      author = e;
    } else {
      author = e.match(regexmine)[0].substring(1);
    }
  }
  attrObj = {
    author: author,
    license: licenseShort,
    licenseUrl: licenseURL
  };
  return attrObj;
}

function fillAttr(input) {
  const artistName = document.getElementById("artistName");
  artistName.textContent = input.artist;
  const license = document.getElementById("license");

  if (
    input.license == "Public domain" ||
    input.license == "No restrictions" ||
    input.license == "---" ||
    input.licenseURL == null ||
    input.license == "Copyrighted free use"
  ) {
    license.setAttribute("class", "ps");
    license.textContent = input.license;
  } else {
    const a = document.createElement("a");
    const g = input.licenseURL;
    a.setAttribute("href", g);

    //input.licenseURL)
    a.textContent = input.license;
    a.setAttribute("class", "attri");
    license.textContent = "";
    license.appendChild(a);
  }
}

let parray = ["Acacia angususasima", "Ambrosia artemisiifolia"];

async function updateSend(data) {
  // const name = document.getElementById("sciname").value;
  //data = dataObj;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  };
  const api_url = "/update";
  const response = await fetch(api_url, options);
  let json = await response.json();
  return json;
}

//BELOW IS ALL THE ORIGINAL FUNCTIONS FOR LARGE ADDS OF DATA

async function submit(dataObj) {
  // const name = document.getElementById("sciname").value;
  const data = dataObj;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  };
  const api_url = "/ap";
  const response = await fetch(api_url, options);
  const json = await response.json();
  return json;
}

//async function manyPost() {
//    let rejects = [];
//    for (let i = 0; i < parray.length; i++) {
//        try {
//            let f = await scrapeMany(parray[i]);
//
//        } catch {
//            err => console.error(err);
//            rejects.push(parray[i]);
//
//        }
//    }
//    console.log(rejects);
//}

//async function scrapeMany(input) {
//    const dataObj = {};
//    dataObj.name = input;
//    let picture = await scrape(dataObj);
//    dataObj.imageURL = picture.imageURL;
//    dataObj.commonName = picture.commonName;
//    let returnedDataObj = await imageAttributes(dataObj);
//
//    //  fillPage(dataObj);
//    //  fillAttr(returnedDataObj);
//    let g = submit(returnedDataObj);
//    return g;
//
//}

const update = document.getElementById("updateDb");
update.addEventListener("click", event => {
  let code2 = window.prompt("Input control code", "1234");
  if (code2 === "pppp") {
    //  updateDb()
  } else {
    window.alert("That was wrong");
  }
});

async function updateDb() {
  let rejects = [];
  for (let i = 0; i < parray.length; i++) {
    try {
      let f = await updateSend({
        name: parray[i]
      });
    } catch {
      err => console.error(err);
      rejects.push(parray[i]);
    }
  }
  console.log(rejects);
}

//const button = document.getElementById("submit");
//button.addEventListener("click", event => {
//    let x = ""
//    let code = window.prompt("Input control code", "1234");
//    if (code === "pppp") {

//    manyPost();
//    } else {
//       window.alert("That was wrong")
//   }
//});

/// CODE BELOW FOR ADDING IFRAME OR NEW TAB FOR SELECTED PLANT
document.querySelector("body").addEventListener("click", function (event) {
  if (document.getElementById("iframe1") != null) {
    const frame = document.getElementById("iframe1");
    frame.parentNode.removeChild(frame);
  } else {
    if (event.target.tagName.toLowerCase() == "img") {
      //const name = document.getElementById("scienName");

      const name = event.target.frameSearchName;
      //  iframeFromPic(name);
      checkForIphone(name);
    }
  }
});

function checkForIphone(namePass) {
  let url = `https://en.wikipedia.org/wiki/${namePass}`;
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    openAndReuseOneTabPerAttribute("myextension-myattribute", url);
  } else {
    iframeFromPic(namePass);
  }
}

function iframeFromPic(namePass) {
  let url = `https://en.wikipedia.org/wiki/${namePass}`;

  if (document.getElementById("iframe1") === null) {
    let PicDiv = document.getElementById("mainPopPic"); //passedId);
    let ifrm = document.createElement("iframe");
    ifrm.setAttribute("src", url);
    ifrm.id = "iframe1";
    PicDiv.appendChild(ifrm);
    ifrm.setAttribute("sandbox", "");
  } else {
    const frame = document.getElementById("iframe1");
    frame.parentNode.removeChild(frame);
    let PicDiv = document.getElementById("mainPopPic");
    let ifrm = document.createElement("iframe");
    ifrm.setAttribute("src", url);
    ifrm.setAttribute("sandbox", "");
    ifrm.id = "iframe1";
    PicDiv.appendChild(ifrm);
  }
}

//  This function listens for the esc key and
// removes the iframe if present.
window.onkeyup = function (event) {
  if (event.keyCode == 27) {
    if (document.getElementById("iframe1") != null) {
      const frame = document.getElementById("iframe1");
      frame.parentNode.removeChild(frame);
    }
  }
};

function openAndReuseOneTabPerAttribute(attrName, url) {
  let windowObjectReference = null; // global variable

  if (windowObjectReference == null || windowObjectReference.closed) {
    /* if the pointer to the window object in memory does not exist
       or if such pointer exists but the window was closed */

    windowObjectReference = window.open(url, "special page");
    /* then create it. The new window will be created and
           will be brought on top of any other window. */
  } else {
    windowObjectReference.focus();
    /* else the window reference must exist and the window
           is not closed; therefore, we can bring it back on top of any other
           window with the focus() method. There would be no need to re-create
           the window or to reload the referenced resource. */
  }
}