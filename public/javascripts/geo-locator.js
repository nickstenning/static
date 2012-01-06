/**
	@name Alphageo V2
	@description Methods to handle geolocation across gov.uk
	@requires core.js
*/
var AlphaGeo = {
	
	location: false,
	full_location: false,

	initialize: function() {
		// look for cookie
		window.console.log('Looking for `geo` cookie.');
		var cookie = AlphaGeo.read_and_parse_json_cookie('geo');
		if (cookie.current_location) {
			AlphaGeo.location = { lat: cookie.current_location.lat, lon: cookie.current_location.lon };
			AlphaGeo.full_location = cookie;
		}

		if (AlphaGeo.location) {
			window.console.log('AlphaGeo.location is present.');
			window.console.dir(AlphaGeo.location);
			// get full location
			if (AlphaGeo.full_location) {
				window.console.log('AlphaGeo.full_location is present.');
				window.console.dir(AlphaGeo.full_location);
				$(AlphaGeo).trigger('location-completed', AlphaGeo.full_location);
			} else {
				window.console.log('AlphaGeo.full_location is not present.');
				AlphaGeo.lookup_full_location( function() {
					window.console.log('AlphaGeo.full_location has been found.');
					window.console.dir(AlphaGeo.full_location);
					$(AlphaGeo).trigger('location-completed', AlphaGeo.full_location);	
				});	
			}
		} else {
			window.console.log('No location cookie found.');
		}

		$(AlphaGeo).bind('location-completed', function(e, location){
			AlphaGeo.save_location_to_cookie(location);			
		});
	},

	read_and_parse_json_cookie: function(name) {
		var cookie = Alphagov.read_cookie(name);
		if (cookie) {
			var json_cookie = $.base64Decode(cookie);
			var geo_json = jQuery.parseJSON(json_cookie);
      		return geo_json;
    	}
    	return false;
	},

	lookup_full_location: function(callback) {
		$.getJSON('/locator.json', AlphaGeo.location, function(data){
			AlphaGeo.full_location = data;	
			callback();
		});	
	},

	locate: function(postcode) {
		AlphaGeo.location = { 'postcode': postcode }
		AlphaGeo.lookup_full_location( function() {
			$(AlphaGeo).trigger('location-completed', AlphaGeo.full_location);
		});
	},

	geolocate: function() {
		if (navigator.geolocation) {
			$(AlphaGeo).trigger('geolocation-started');
			AlphaGeo.browser_geolocate();
			$(AlphaGeo).bind('geolocation-completed', function(e, position) {
				AlphaGeo.location = position;
				AlphaGeo.lookup_full_location( function() {
					$(AlphaGeo).trigger('location-completed', AlphaGeo.full_location);
				}); 
			});
		} else {
			$(AlphaGeo).trigger('geolocation-failed');	
		}
	},

	browser_geolocate: function() {
		window.console.info("Geolocation started");
		navigator.geolocation.getCurrentPosition(
      function(position) {
      	window.console.info("Geolocation finished");
      	coordinates = {lat: position.coords.latitude, lon: position.coords.longitude};
        $(AlphaGeo).trigger('geolocation-completed', coordinates);
      },
      function() {
      	$(AlphaGeo).trigger('geolocation-failed');
      }
    );				
	},

	save_location_to_cookie: function() {
		window.console.dir(AlphaGeo.full_location);
		var cookie = $.base64Encode(JSON.stringify(AlphaGeo.full_location));
		window.console.dir(cookie);
		Alphagov.write_cookie('geo', cookie);		
		window.console.log("Saved to cookie.");
	},

	remove: function() {
		Alphagov.delete_cookie('geo');
		$(AlphaGeo).trigger('location-removed');	
	}

}

var AlphaGeoForm = function(selector) {
	
	var form 				= $(selector);
	var ask_ui 			= form.find('.ask_location');
	var finding_ui 	= form.find('.finding_location');
	var found_ui 		= form.find('.found_location');
	var all_ui			= [ask_ui, finding_ui, found_ui];

	function show_ui(selector) {
		$(all_ui).each(function(k, item){
			item.hide().css('visibility','hidden');			
		});
		selector.show().css('visibility','visible');
	}

	if (navigator.geolocation) {
    $('<p class="geolocate-me">or <a href="#">locate me automatically</a></p>').appendTo(ask_ui);
  
	  $(".geolocate-me a").live('click', function(e){
	    e.preventDefault();
	    AlphaGeo.geolocate();
	  });

	  $(AlphaGeo).bind("geolocation-started", function() {
	  	show_ui(finding_ui);
		});

	  $(AlphaGeo).bind("geolocation-failed", function() {
			window.console.info("Geolocation failed.");
	  	show_ui(ask_ui);
		});
	}

	$('a.change-location').click( function(e){
		e.preventDefault();
		AlphaGeo.remove();
	});

	$(AlphaGeo).bind("location-completed", function(e, location) {
  	found_ui.find('strong, a span.friendly-name').text(location.current_location.locality);
  	show_ui(found_ui);
	});

	$(AlphaGeo).bind("location-removed", function(e, location) {
  	found_ui.find('strong, a span.friendly-name').text('');
  	show_ui(ask_ui);
	});

  form.submit( function(e) {
  	e.preventDefault();
  	AlphaGeo.locate( form.find('input#postcode').val() );
  });

}

/** Logging **/
$(AlphaGeo).bind("location-completed", function() {
	window.console.info("Location completed");
	window.console.dir(AlphaGeo.location);
	window.console.dir(AlphaGeo.full_location);
});

$(document).ready( function() {
	AlphaGeo.initialize();
});