// Copyritght Brooks Smith 2019
// MIT License  - Have fun.
let dbObject = {};
const loadData = document.getElementById("loadData");
loadData.addEventListener("click", async event => {
    const response = await fetch("/sciNames")
    const json = await response.json()
    //   console.log(json);
    loadOp(json);
    dbObject = json;
    //  console.log(dbObject);

});

function loadOp(json) {
    json.sort(function (a, b) {
        var textA = a.name.toLowerCase();
        var textB = b.name.toLowerCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    const selects = json;
    //   console.log(selects.length);
    const nameSelects = document.getElementById("nameSelect");
    for (let i = 0; i < selects.length; i++) {
        let option = document.createElement("option");
        option.value = selects[i].name;
        option.text = selects[i].name;
        nameSelects.appendChild(option);
    }
    renderSelects(selects)
}

const renderSelects = function (dataObj) {
    const nameSelector = document.getElementById("nameSelect");
    nameSelector.addEventListener("change", event => {
        //    console.log(nameSelector.options[nameSelector.selectedIndex].value);
        let g = (dataObj[nameSelector.selectedIndex]);
        fillPage(g);
        console.log(g);
        fillAttr(g);

    })
}

const submitArtist = document.getElementById("submitArtist");
submitArtist.addEventListener("click", async event => {
    const nameSelector = document.getElementById("nameSelect").value;
    const artist = document.getElementById("artistInput").value;
    //let g = (dataObj[nameSelector.selectedIndex]);
    let updateArtist = {
        "name": nameSelector,
        "artist": artist
    }
    const response = await updateSend(updateArtist);
    //  console.log(dbObject.nameSelector)
    dbObject[document.getElementById("nameSelect").selectedIndex].artist = updateArtist.artist;
    document.getElementById("artistInput").value = "";
    document.getElementById("artistName").textContent = updateArtist.artist;
});

const submitCommonName = document.getElementById("submitCommmonName");
submitCommonName.addEventListener("click", async event => {
    const nameSelector = document.getElementById("nameSelect").value;
    const commonName = document.getElementById("commonNameInput").value;
    //let g = (dataObj[nameSelector.selectedIndex]);
    let updateCommonName = {
        "name": nameSelector,
        "commonName": commonName
    }
    const response = await updateSend(updateCommonName);
    dbObject[document.getElementById("nameSelect").selectedIndex].commonName = updateCommonName.commonName;
    document.getElementById("commonNameInput").value = "";
    document.getElementById("commonName").textContent = updateCommonName.commonName;
});


const submitText = document.getElementById("submitText");
submitText.addEventListener("click", async event => {
    const nameSelector = document.getElementById("nameSelect").value;
    const text = document.getElementById("textArea").value;
    //let g = (dataObj[nameSelector.selectedIndex]);
    let updateDescriptionText = {
        "name": nameSelector,
        "descriptionText": text
    }
    console.log("update Description")
    const response = await updateSend(updateDescriptionText);
    dbObject[document.getElementById("nameSelect").selectedIndex].descriptionText = updateDescriptionText.descriptionText;
    console.log(response) // document.getElementById("textArea").value = "";
    document.getElementById("textArea").textContent = updateDescriptionText.descriptionText;
});









const scrapebutton = document.getElementById("scrape");
scrapebutton.addEventListener("click", event => {
    scrapeOne();
});

async function scrapeOne() {
    const dataObj = {};
    dataObj.name = document.getElementById('sciname').value;
    let picture = await scrape(dataObj);
    dataObj.imageURL = picture.imageURL;
    dataObj.commonName = picture.commonName;
    let returnedDataObj = await imageAttributes(dataObj);

    fillPage(dataObj);
    fillAttr(returnedDataObj);
    //  submit(returnedDataObj);
}



async function scrape(dataObj) {
    const name = dataObj.name;
    const api_url = "/getWiki";
    data = {
        "scientificName": name
    }
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    };
    const response = await fetch(api_url, options)
    return response.json()

}

const fillPage = function (dataObj) {
    const scienName = document.getElementById("scienName")
    scienName.textContent = dataObj.name;

    const commonName = document.getElementById("commonName");
    commonName.textContent = dataObj.commonName;

    const elemImg = document.getElementById("picture");
    elemImg.setAttribute("src", "https://" + dataObj.imageURL.substring(2));

    const pictureURL = document.getElementById("pictureURL");
    pictureURL.textContent = dataObj.imageURL;

    const descriptionText = document.getElementById("textArea");
    if (dataObj.hasOwnProperty("descriptionText")) {
        descriptionText.value = dataObj.descriptionText;
    } else {
        descriptionText.value = "write something"
    }
}

async function imageAttributes(dataObj) {
    const regexuse = /([^/]*[^/\d])\d*\.(jpg|JPG|png|jpeg|GIF|gif|PNG)/;
    let imageJPGName = dataObj.imageURL.substring(2).match(regexuse)[0];
    //console.log(imageJPGName);
    const imageInfoURL = "https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=extmetadata&titles=File:" +
        imageJPGName + "&format=json";

    const api_url = "/getAttr";
    data = {
        "apiURL": imageInfoURL
    }
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    };
    const response = await fetch(api_url, options)
    const json = await response.json();
    let attribData = imageAttr(json);
    dataObj.artist = attribData.author;
    dataObj.license = attribData.license;
    dataObj.licenseURL = attribData.licenseUrl
    return dataObj;
}


function imageAttr(json) {
    let regexmine = /(?!><)>(.*)(?=<)/;
    let attrObj = {};

    const attrData = json;
    let pagenum = (Object.keys(json.query.pages));
    let licenseShort;
    //  if (attrData.hasOwnProperty('extmetadata')) {
    if (
        attrData.query.pages[pagenum].imageinfo[0].extmetadata
        .LicenseShortName == undefined
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
            attrData.query.pages[pagenum].imageinfo[0].extmetadata.LicenseUrl
            .value;
    }
    let author;
    if (
        attrData.query.pages[pagenum].imageinfo[0].extmetadata.Artist ==
        undefined
    ) {
        author = "none listed";
    } else {
        let e =
            attrData.query.pages[pagenum].imageinfo[0].extmetadata.Artist.value;
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
    return (attrObj);

}
const fillAttr = function (input) {

    const artistName = document.getElementById("artistName");
    artistName.textContent = input.artist;
    const license = document.getElementById("license");

    if (input.license == "Public domain" || input.license == "No restrictions" ||
        input.license == "---" || input.licenseURL == null || input.license == "Copyrighted free use") {
        license.setAttribute("class", "ps")
        license.textContent = input.license;

    } else {

        const a = document.createElement('a');
        const g = (input.licenseURL);
        a.setAttribute("href", g); //input.licenseURL)
        a.textContent = input.license;
        a.setAttribute("class", "attri");
        license.textContent = "";
        license.appendChild(a);
    }
}



let parray = [
    'Acacia angususasima',
    'Ambrosia artemisiifolia'
];

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
    //  console.log(api_url, options);
    const response = await fetch(api_url, options);
    let json = await response.json();
    return json;
}


//BELOW IS ALL THE ORIGINAL FUNCTIONS FOR LARGE ADDS OF DATA






async function submit(dataObj) {
    // const name = document.getElementById("sciname").value;
    data = dataObj;
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
    return (json);
}

async function manyPost() {
    let rejects = [];
    for (let i = 0; i < parray.length; i++) {
        try {
            console.log(parray[i]);
            let f = await scrapeMany(parray[i]);
            //    console.log(f);

        } catch {
            err => console.error(err);
            rejects.push(parray[i]);
            //      console.log('something');
        }
    }
    console.log(rejects);
}


async function scrapeMany(input) {
    const dataObj = {};
    dataObj.name = input;
    let picture = await scrape(dataObj);
    dataObj.imageURL = picture.imageURL;
    dataObj.commonName = picture.commonName;
    let returnedDataObj = await imageAttributes(dataObj);

    //  fillPage(dataObj);
    //  fillAttr(returnedDataObj);
    let g = submit(returnedDataObj);
    return g;

}


const update = document.getElementById("updateDb");
update.addEventListener("click", event => {
    let code2 = window.prompt("Input control code", "1234");
    if (code2 === "pppp") {
        // console.log("Correct");
        //  updateDb();
    } else {
        window.alert("That was wrong")
    }
});


async function updateDb() {
    let rejects = [];
    for (let i = 0; i < parray.length; i++) {
        try {
            //console.log(parray[i], "howdy");
            let f = await updateSend({
                "name": parray[i]
            });
            //   console.log(f);

        } catch {
            err => console.error(err);
            rejects.push(parray[i]);
            //  console.log('something');
        }
    }
    console.log(rejects);
}

const button = document.getElementById("submit");
button.addEventListener("click", event => {
    let x = ""
    let code = window.prompt("Input control code", "1234");
    if (code === "pppp") {
        console.log("Correct");
        //    manyPost();
    } else {
        window.alert("That was wrong")
    }
});

document
    .querySelector("body")
    .addEventListener("click", function (event) {

        if (document.getElementById("iframe1") != null) {
            const frame = document.getElementById("iframe1");
            frame.parentNode.removeChild(frame);

        } else {
            if (event.target.tagName.toLowerCase() == "img") {
                const name = document.getElementById("scienName").textContent;
                console.log(name);
                iframeFromPic(name);
                // checkForIphone(inputArr[pass].name);

            }
        }
    });



function iframeFromPic(namePass) {

    let url = `https://en.wikipedia.org/wiki/${namePass}`;

    if (document.getElementById("iframe1") === null) {
        console.log("here")
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
};


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

//https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=extmetadata&titles=File:Opossum 2.jpg&format=json