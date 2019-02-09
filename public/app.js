////////////////////////////////
// json to grab all the books
///////////////////////////////

$.getJSON("/books", function(data) {
    // For each book
    for (var i = 0; i < data.length; i++) {
      // display all books on the page
      $("#books").append("<div class='allbooks'><p class='bookTitle' data-id='" + data[i]._id + "'>" + data[i].title + "<br /></p><span class='link'>" + data[i].link + "</span></div>");
    }
  });


  
  ///////////////////////////////////////////
  // Whenever someone clicks on a book title
////////////////////////////////////////////


  $(document).on("click", ".bookTitle", function() {
    // empty notes
    $("#notes").empty();
    // save the book's ID
    var thisId = $(this).attr("data-id");
  
    // ajax call for the selected book
    $.ajax({
      method: "GET",
      url: "/books/" + thisId
    })
      
      .then(function(data) {

        //making sure the data is accurate
        console.log(data);

        // Display the title of the book above the note area
        $("#notes").append("<h2 id='bookHeader'>" + data.title + "</h2>");
        // text area for note titles
        $("#notes").append("<input id='commentHeader' name='title' >");
        // text area for notes
        $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
        // use the ID of the book to submit new notes to the db
        $("#notes").append("<button data-id='" + data._id + "' id='commentbtn'>Comment</button>");
  
        // if there's already an existing note...

        if (data.note) {
          // put the value of the note into the title are
          $("#commentHeader").val(data.note.title);
          // put the value of the note into the text area
          $("#bodyinput").val(data.note.body);
        }
      });
  });


  ////////////////////////////
  // If a user submits a note:
//////////////////////////////

  $(document).on("click", "#commentbtn", function() {

    // use the ID of the book to connect the note
    var thisId = $(this).attr("data-id");
  
    // A POST to view and/or update existing notes
    $.ajax({
      method: "POST",
      url: "/books/" + thisId,
      data: {
        // store the value from user's note titles
        title: $("#commentHeader").val(),
        // store the value from user's text area
        body: $("#bodyinput").val()
      }
    })

      .then(function(data) {      
        $("#notes").empty();
      });
  
    // trim values entered in notes
    $("#commentHeader").val("");
    $("#bodyinput").val("");
  });
  