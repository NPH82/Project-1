//////////////////////////////////////////////////////////
//BACK END
//////////////////////////////////////////////////////////

//Google Maps API apikey: AIzaSyA4PbxtjFAOdO90WsLjM_SXs_sfUEb7OM0

window.mapsLoaded = false;

function initMap() {
  window.mapsLoaded = true;
}

//Geolocation
var map, infoWindow;
var marker;

function notInitMap(id) {

  map = new google.maps.Map(document.getElementById('map'));

  infoWindow = new google.maps.InfoWindow;

  //Uses HTML5 geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        var turtleStatus = "reported";
        marker = new google.maps.Marker({
          postion: pos,
          map: map,
          animation: google.maps.Animation.DROP
        });
        marker.setPosition(pos);
        map.setCenter(pos);
        map.setZoom(16);


        // REWORKED THIS CALL Getting location and creating JSON on Firebase
        var database = firebase.database();

        var comment = $("#comment-input").val(),
          name = $("#name-input").val(),
          phone = $("#phoneNumber-input").val(),
          email = $("#email-input").val(),
          turtleCard = database.ref('turtleCard'),
          time = moment().format('MMMM Do YYYY, h:mm a'),
          locationLat = position.coords.latitude,
          locationLong = position.coords.longitude,
          data = {
            Lat: locationLat,
            Long: locationLong,
            name: name,
            phone: phone,
            email: email,
            comment: comment,
            time: time,
            status: "reported"
          };

        database.ref("Turtle " + count).set(data);
        database.ref("Count").set(count);
        database.ref("Saved").set(savedCount);
        resetForm();

      },
      function() {
        handleLocationError(true, infoWindow, map.getCenter());
      })
  } else {
    //Browser doesn't suppport Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
    'Error: We can\'t get your location.  Please refresh and accept.' :
    'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

//Initializes Firebase
var config = {
  apiKey: "AIzaSyBZAuUkeBYHmxfplYwuf-7wNHwKUFSLZcU",
  authDomain: "turtle-project.firebaseapp.com",
  databaseURL: "https://turtle-project.firebaseio.com",
  projectId: "turtle-project",
  storageBucket: "",
  messagingSenderId: "919793437616"
};
firebase.initializeApp(config);

//Authenticates Firebase Anonymously
firebase.auth().signInAnonymously().catch(function(error) {
  //Handling errors
  var errorCode = error.code;
  var errorMessage = error.message;

  if (errorCode === 'auth/operation-not-allowed') {
    alert('You must enable Anonymous auth in Firebase Console');
  } else {
    console.error(error);
  }
});

//Creates User Account
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    var isAnonymous = user.isAnonymous;
    var uid = user.id;
    console.log("Locating user");
  } else {
    console.log("User signed out");
  }
})


//Creates turtle object
var turtles = {};

//Sets turtle value to database
firebase.database().ref().on("value", function(snapshot) {
  turtles = snapshot.val();
});
firebase.database().ref().on("value", snap => {
  turtles = snap.val();
});


//Sends location
count = turtles.Count;
$("#send").on("click", function(event) {
  event.preventDefault();
  count = turtles.Count;
  count++;
  notInitMap();
  turtleDiv(false);
  Materialize.toast("Your location has been sent.", 2000);
});

//Submits form and sends location
$("#submit").on("click", function(event) {
  event.preventDefault();
  validate();
  validateEmail();
  $('#message-modal').modal('close');
  count = turtles.Count;
  count++;
  notInitMap();
  turtleDiv(true);
  Materialize.toast("Your report has been sent.", 2000);
});

//Validates form
function validate() {
  if ($("#name-input").val() == "") {
    Materialize.toast("Please provide your name.", 2000);
    $.thisBreaksTheForm.database;
    return false;
  }

  if ($("#phoneNumber-input").val() == "") {
    Materialize.toast("Please provide a valid phone number.", 2000);
    $.thisBreaksTheForm.database;
    return false;
  }

  if ($("#email-input").val() == "") {
    Materialize.toast("Please provide a valid email.", 2000);
    $.thisBreaksTheForm.database;
    return false;
  }

  return (true);
};

function validateEmail() {
  var emailID = $("#email-input").val();
  atpos = emailID.indexOf("@");
  dotpos = emailID.lastIndexOf(".");

  if (atpos < 1 || (dotpos - atpos < 2)) {
    Materialize.toast("Please provide a valid email.", 2000);
    $.thisBreaksTheForm.database;
    return false;
  }
  return (true);
};

//Resets form
function resetForm() {
  $("#comment-input").val("");
  $("#name-input").val("");
  $("#phoneNumber-input").val("");
  $("#email-input").val("");
}

//Creats turtle card in document
function turtleDiv(noComm) {
  var comment = $("#comment-input").val();
  $("#fullCard").clone().prependTo("#tab1");
  $("#tab1-heading").attr('class', 'no-card hide');
  $("#turtle").attr('class', 'card hoverable show');
  $("#number").empty();
  $("#reported").empty();
  $("#reported").append("<p>" + "Reported " + moment().format('MMMM Do YYYY, h:mm a') + "</p>");
  $("#comment").empty();
  $("#comment").append(comment);
  $("#turtle").append("<div id='turtle' class='card hoverable hide");
  if (noComm) {
    $("#number").append("Turtle " + count + "<i class='material-icons right'>more_vert</i>");
  } else {
    $("#number").append("Turtle " + count);
  }

}

//Moves turtle card from Reported to Dispatched
$("#tab1").on("click", "#next-stage-btn", function() {
  $("#tab2-heading").attr('class', 'no-card hide');
  $("#fullCard").appendTo("#tab2");
  Materialize.toast("This turtle has been moved to DISPATCHED.", 2000);
});

//Moves turtle card from Dispatched to Saved
var savedCount = turtles.Saved;
$("#tab2").on("click", "#next-stage-btn", function() {
  savedCount = turtles.Saved;
  savedCount++;
  $("#counter").text(turtles.Saved);
  $("#tab3-heading").attr('class', 'no-card hide');
  $(this).parents("#fullCard").prependTo("#tab3");
  $("#tab3").find(".sticky-action").html("");

  Materialize.toast("This turtle has been moved to SAVED.", 2000);
});


//////////////////////////////////////////////////////////
//DOCUMENT.READY
//////////////////////////////////////////////////////////

$(document).ready(function() {

  //FRONT END

  //Parallax page
  $('.parallax').parallax();

  //Sidebar menu
  $(".button-collapse").sideNav({
    menuWidth: 250,
    closeOnClick: true,
  });

  //Floating action button
  $("#report-button").on("mouseover", function() {
    $("#report-button").children("a").removeClass("pulse");
    $("#report-button").children("a").children("i").text("place");
  });
  $("#report-button").on("mouseout", function() {
    $("#report-button").children("a").children("i").text("add");
  });

  //Trigger modal
  $(".modal").modal();

  //BACK END

  //Formspree ajax
  $('#reportNewTurtle-form').submit(function(e) {
    var name = $('#name-input')
    var email = $('#email-input')
    var phone = $('#phoneNumber-input')
    var landmarks = $('#comment-input')
    $.ajax({
      method: 'POST',
      url: '//formspree.io/umassturtlepower@gmail.com',
      data: $('#report-form').serialize(),
      datatype: 'json'
    });
    e.preventDefault();
    $(this).get(0).reset();
  });


});
