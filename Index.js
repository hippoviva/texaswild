const express = require("express");
const app = express();
const Datastore = require("nedb");
const cheerio = require("cheerio");
const fetch = require("node-fetch");
require("dotenv").config();
const Filter = require('bad-words'),
    filter = new Filter();





app.use(express.static("public"));
app.use(
    express.json({
        limit: "1mb"
    })
);

function notFound(req, res, next) {
    res.status(404);
    const error = new Error("Not Found");
    next(error);
}

function errorHandler(error, req, res, next) {
    res.status(res.statusCode || 500);
    res.json({
        message: error.message
    });
}
//app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Starting server at ${port}`);
});
app.use(express.static("public"));
app.use(
    express.json({
        limit: "1mb"
    })
);

const database = new Datastore("database.db");
database.loadDatabase();



app.post("/ap", async (req, res) => {
    try {
        console.log("add record request");
        const data = req.body;
        database.insert(data);
        res.json(data);
    } catch {
        err => console.error(err);
    }
});

app.post("/getwiki", async function (req, res, next) {
    try {
        console.log("get image.jpg request")
        const sciName = req.body;
        fetch("https://en.wikipedia.org/wiki/" + sciName.scientificName)
            .then(res => res.text())
            .then(body => {
                const results = getImage(body);
                res.json(results);
            })
            .catch(err => console.error(err));

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }
})


function getImage(body) {
    const $ = cheerio.load(body);
    const imageURL = $("tbody tr:nth-child(2)", ".infobox")
        .find("img")
        .attr("src");
    const commonName = $(".firstHeading").text();
    return {
        imageURL,
        commonName
    };
}


app.post("/getAttr", async (req, res) => {
    try {
        console.log("attribute request");
        const data = req.body;
        const response = await fetch(data.apiURL);
        const attrData = await response.json()
        //database.insert(data);
        res.json(attrData);
    } catch {
        err => console.error(err);
    }
});


//DATABASE WORK

app.get("/dataFind", (request, response) => {
    try {
        //let foundDoc;
        console.log("I got a dataFind request");
        database.find({}, (err, data) => {
            if (err) {
                response.end();
                return;
            }
            response.json(data);
        });
    } catch (error) {
        console.log(error);
    }
});


app.post("/update", (request, response) => {
    try {
        console.log("update Request")
        const updateResponse = update(request.body);
        response.json(updateResponse);

    } catch (error) {
        console.log(error);
    }
});

const update = function (req) {
    const selection = Object.keys(req)[1];
    const text = (filter.clean(req[selection]))
    const text2 = req[selection];
    database.update({
        name: req.name
    }, {
        $set: {
            [selection]: text2
        }
    }, {
        multi: false
    }, function (err, numReplaced) {})
    return (text2);

};


app.get("/sciNames", (request, response) => {
    try {
        console.log("I got a dataFind request");
        database.find({

        }, function (err, data) {
            //   console.log(data);
            response.json(data);
        });
    } catch (error) {
        console.log(error);
    }
});