var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var app = express();

// scraping programs
var cheerio = require("cheerio");
var axios = require("axios");

// Book and Note models
var db = require("./models");

var PORT = 3000;

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//make public folder static
app.use(express.static("public"));

// connect to mongodb and create db 'bookitdb'
mongoose.connect("mongodb://localhost/bookitdb", { useNewUrlParser: true });


/////////////////////////
// GET route for scraping
//////////////////////////

app.get("/scrape", function (req, res) {
    // using axios to grab the body of the URL
    axios.get("https://www.barnesandnoble.com/b/books/_/N-1fZ29Z8q8").then(function (response) {

        // saving this data with cheerio as a variable
        var $ = cheerio.load(response.data);

        //(optional) checking to make sure data is available to use
        // console.log(response.data)

        // grab every h3 within a div tag, and do the following:
        $("div h3").each(function (i, element) {

            // create an empty object to store our data
            var result = {};

            // the text of each 'a' tag will be saved in the result object as 'title'
            result.title = $(this)
                .children("a")
                .text();

            //the href links will be saved in the result object as 'link'
            result.link = $(this)
                .children("a")
                .attr("href");

            // used scraped data to create a new Book using the 'result' object
            db.Book.create(result)
                .then(function (dbBook) {

                    // View the added results in the console
                    console.log(dbBook);
                })

                // If there were any problems, we catch it here and log the error
                .catch(function (err) {
                    console.log(err);
                });
        })
    });
    
    //update to let us know that the scrape was successful
    res.send("Scrape was a success!!");
});


/////////////////////////////////
// GET route to get Books from db
////////////////////////////////

app.get("/books", function (req, res) {

    // go to books collection and find() every document
    db.Book.find({})
        .then(function (dbBook) {
            
            // if books are available, we display them to the client
            res.json(dbBook);
        })
        .catch(function (err) {
            // In case of errors, we send that to the client too
            res.json(err);
        });
});

///////////////////////////////////////////////////////////////////
// Route for grabbing a specific Book by id, populate it with it's note
////////////////////////////////////////////////////////////////////////


app.get("/books/:id", function (req, res) {

    // Using the id passed in the id parameter, look for the book in our database
    db.Book.findOne({ _id: req.params.id })

        // if found, populate all the notes associated with it
        .populate("note")
        .then(function (dbBook) {
            
            // send the book back to the client to display the Title in notes area
            res.json(dbBook);
        })

        //check for errors and send them to client if they exist
        .catch(function (err) {
          
            res.json(err);
        });
});


///////////////////////////////////////////////////
// Route for saving/updating an Book's notes
////////////////////////////////////////////////


app.post("/books/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Book.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbBook) {
          
            // once we update a book's note, send it back to the client
            res.json(dbBook);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// begin the server
app.listen(PORT, function () {
    console.log("Running on port " + PORT + "!");
});
