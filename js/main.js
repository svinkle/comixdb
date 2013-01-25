var com = {};
com.comixdb = {};
com.comixdb.api_key = "76b4060a37df943052cc71e7e56dad27a56f9504";
com.comixdb.offset = 0;

com.comixdb.init = function() {
	if (!com.comixdb.QueryString || com.comixdb.QueryString === undefined) {
		return false;
	}	
		
	if (com.comixdb.QueryString.search) {		
		com.comixdb.query("search", com.comixdb.QueryString.search);
		$("#results").html("");
	}
	
	if (com.comixdb.QueryString.character) {		
		com.comixdb.query("character", "", com.comixdb.QueryString.character);
		$(".loading").show();
		$("#results").html("");
	}
	
	if (com.comixdb.QueryString.debug) {				
		$("#viewport").show();
	}
};

com.comixdb.query = function(page_type, term, id, list) {	
	var url = "";
	
	switch(page_type) {
	case "search":
		var uri_term = encodeURIComponent(term);	
		url = "search/?api_key="+com.comixdb.api_key+"&query="+uri_term+"&resources=character&field_list=id,image,name,publisher&sort=name&offset="+com.comixdb.offset;
		break;
	case "character":
		url = "character/"+id+"/?api_key="+com.comixdb.api_key+"&field_list=birth,character_enemies,character_friends,deck,description,gender,image,real_name,movies,name,publisher&sort=name";
		break;
	case "character_list":
		url = "character/"+id+"/?api_key="+com.comixdb.api_key+"&field_list=id,image,name,publisher&sort=name";
		break;
	case "movies_list":
		url = "movie/"+id+"/?api_key="+com.comixdb.api_key+"&field_list=id,image,name,release_date&sort=release_date";
		break;
	default:
		url="search/?api_key="+com.comixdb.api_key+"&query="+term+"";
	}
		
	$.getJSON('http://api.comicvine.com/'+url+'&format=jsonp&json_callback=?', function(data) {				
		if (!data || data === undefined) {
			$("#results").html("<p>No results found.</p>");
			return false;
		}
		
		if (!data.number_of_page_results) {
			$("#results").html("<p>No results found.</p>");
			return false;
		}
			
		if (page_type === "search") {		
			if (com.comixdb.offset === 0) {
				$("#results").append('<ul class="results_list" />');
			}
			$.each(data.results, function(i) {						
				if (data.results[i].resource_type === "character") {							
					com.comixdb.formatSearch(data.results[i]);					
				}
			});			
			if (data.number_of_total_results > 20 && ((data.number_of_total_results - com.comixdb.offset) > 20)) {
				$("#search_more").show();
			} else {
				$("#search_more").hide();
			}
		}
		if (page_type === "character") {		
			com.comixdb.formatCharacter(data);			
		}
		if (page_type === "character_list") {								
			com.comixdb.formatCharacterList(data, list);			
		}
		if (page_type === "movies_list") {								
			com.comixdb.formatMovieList(data, list);			
		}
	});
};

com.comixdb.formatSearch = function(data) {		
	var results = "", image = "", name = "";	
	if (data.image === undefined || data.image === null) {
		image = "img/blank.gif";
	} else {
		image = data.image.small_url;
	}
	if (data.name === undefined || data.name === null) {
		name = "No Name";
	} else {
		name = data.name;
	}	
	if (data.publisher.name !== "A") {
		results = '<li><a href="?character=' + data.id + '" class="list_link"><img src="' + image + '" alt="' + name + ' icon" class="character_icon" /> ' + name + ' <span>(' + data.publisher.name + ')</span></a></li>';
	}
	$("#results ul").append(results);	
};

com.comixdb.formatCharacter = function(data) {		
	var results = "", friends = "", enemies = "", movies = "";
	// birth,character_enemies,character_friends,deck,description,gender,image,real_name,movies,name,publisher		
		
	if (!$.isEmptyObject(data.results.character_friends)) {
		friends = friends + '<h3><a href="#" id="friends_toggle" class="toggle"><span aria-hidden="true" class="icon-plus"></span><span aria-hidden="true" class="icon-minus"></span> Friends</a></h3>';	
		friends = friends + '<div id="friends" class="toggle_body"><ul id="friends_list" class="results_list">';
		$.each(data.results.character_friends, function(i) {						
			com.comixdb.query("character_list", "", data.results.character_friends[i].id, 'friends');							
		});
		friends = friends + '</ul></div>';
	}
	
	if (!$.isEmptyObject(data.results.character_enemies)) {
		enemies = enemies + '<h3><a href="#" id="enemies_toggle" class="toggle"><span aria-hidden="true" class="icon-plus"></span><span aria-hidden="true" class="icon-minus"></span> Enemies</a></h3>';		
		enemies = enemies + '<div id="enemies" class="toggle_body"><ul id="enemies_list" class="results_list">';
		$.each(data.results.character_enemies, function(j) {						
			com.comixdb.query("character_list", "", data.results.character_enemies[j].id, 'enemies');							
		});	
		enemies = enemies + '</ul></div>';
	}
	
	if (!$.isEmptyObject(data.results.movies)) {
		movies = movies + '<h3><a href="#" id="movies_toggle" class="toggle"><span aria-hidden="true" class="icon-plus"></span><span aria-hidden="true" class="icon-minus"></span> Movies</a></h3>';		
		movies = movies + '<div id="movies" class="toggle_body"><ul id="movies_list" class="results_list">';
		$.each(data.results.movies, function(k) {						
			com.comixdb.query("movies_list", "", data.results.movies[k].id, 'movies');							
		});	
		movies = movies + '</ul></div>';	
	}
		
	results += (data.results.name) ? '<h2 class="character_name">'+data.results.name+'</h2>' : "";
	results += '<div class="clearfix">';
	results += '<aside>';
	results += '<a href="'+data.results.image.super_url+'" class="fancybox" rel="group"><img src="'+data.results.image.super_url+'" alt="Image of '+data.results.name+'" class="character_image" /></a>';
	results += '<ul class="results_list">';
	results += (data.results.real_name) ? '<li>Name: '+data.results.real_name+'</li>' : "";	
	results += (data.results.birth) ? '<li>Date of Birth: '+moment(data.results.birth).format("MMMM Do, YYYY")+'</li>' : "";
	results += (data.results.gender) ? '<li>Gender: '+((data.results.gender === 1) ? "Male" : "Female")+'</li>' : "";
	results += (data.results.publisher) ? '<li>Publisher: '+data.results.publisher.name+'<li>' : "";
	results += '</ul>';
	results += '<p class="cvlink">Find more information about <em>'+data.results.name+'</em> on <a href="http://www.comicvine.com/" target="_blank">Comic Vine</a>.</p>';
	results += '</aside>';
	results += '<section>';		
	results += (data.results.deck) ? '<p class="teaser">'+data.results.deck+'</p>' : "";
	results += ($.isEmptyObject(data.results.description)) ? '<h3><a href="#" id="description_toggle" class="toggle"><span aria-hidden="true" class="icon-plus"></span><span aria-hidden="true" class="icon-minus"></span> Description</a></h3><div id="description" class="toggle_body">'+data.results.description+'</div>' : "";
	results += (friends) ? friends : "";
	results += (enemies) ? enemies : "";
	results += (movies) ? movies : "";
	results += '</section>';
	results += '</div>';
	
	$("#results").append(results);	
	
	// Remove anchors from description
	$("#description").find("a:not(:has(img))").removeAttr("href").addClass("no_link");	
	$("#description").find("a:has(img)").addClass("fancybox").attr("rel","group");
	$(".wiki-img-right,.wiki-img-left").addClass("clearfix");	
	
	$(".fancybox").fancybox();	
	
	$(".toggle").click(function() {		
		$(this).parent("h3").next(".toggle_body").toggle();
		$(this).find("span").toggle();
		return false;
	});
	
	$(".loading").hide();
};

com.comixdb.formatCharacterList = function(data, list) {			
	var results = "", image = "";	
	if (data.results.image === undefined || data.results.image === null) {
		image = "img/blank.gif";
	} else {
		image = data.results.image.small_url;
	}		
	results = '<li><a href="?character=' + data.results.id + '" class="list_link"><img src="' + image + '" alt="' + data.results.name + ' icon" class="character_icon" /> ' + data.results.name + '</a></li>';	
	$("#"+list+"_list").append(results);	
};

com.comixdb.formatMovieList = function(data, list) {			
	var results = "", image = "";	
	if (data.results.image === undefined || data.results.image === null) {
		image = "img/blank.gif";
	} else {
		image = data.results.image.small_url;
	}		
	results = '<li><a href="http://www.imdb.com/find/?q=' + data.results.name + '" class="list_link" target="_blank"><img src="' + image + '" alt="' + data.results.name + ' icon" class="character_icon" /> ' + data.results.name + ' <span>(' + moment(data.results.release_date).format("YYYY") + ')</span></a></li>';
	$("#"+list+"_list").append(results);	
};

/*
com.comixdb.formatConcept = function() {};
com.comixdb.formatOrigin = function() {};
com.comixdb.formatObject = function() {};
com.comixdb.formatLocation = function() {};
com.comixdb.formatIssue = function() {};
com.comixdb.formatStoryArc = function() {};
com.comixdb.formatVolume = function() {};
com.comixdb.formatPublisher = function() {};
com.comixdb.formatPerson = function() {};
com.comixdb.formatTeam = function() {};
com.comixdb.formatVideo = function() {};
*/

$("#search_field").keyup(function(e) {
	if ($(this).length > 0) {
		$("#clear_search").fadeIn();
	} else {
		$("#clear_search").fadeOut();
	}
	if (e.keyCode === '13') {
		e.preventDefault();
		$("#search_form").submit();		
	}
});

$("#clear_search").click(function() {
	$("#search_field").val("").focus();
	return false;
});

$("#search_more").click(function() {	
	com.comixdb.offset = com.comixdb.offset + 20;
	com.comixdb.query("search", com.comixdb.QueryString.search);
	return false;
});

com.comixdb.QueryString = function () {	
	var query_string = {};
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
    	if (typeof query_string[pair[0]] === "undefined") {
			query_string[pair[0]] = pair[1];
		} else if (typeof query_string[pair[0]] === "string") {
			var arr = [ query_string[pair[0]], pair[1] ];
			query_string[pair[0]] = arr;
		} else {
			query_string[pair[0]].push(pair[1]);
		}
	} 
    return query_string;
}();

$(document).ready(function() {
	com.comixdb.init();
});

// Media Queries
var mq = {};
mq.current_mq = "";
mq.media_query = mq.getMediaQuery;
mq.viewport = document.getElementById("viewport");

mq.getMediaQuery = function() {
    return window.getComputedStyle(document.body, ":after").getPropertyValue("content");
};

mq.displayViewport = function() {
    mq.viewport.innerHTML = "<div>Viewport: " + document.documentElement.clientWidth + " x " + document.documentElement.clientHeight + "</div><div>Media Query: " + mq.getMediaQuery() + "</div>";
};

mq.displayMq = function() {
    mq.current_mq = mq.getMediaQuery();
    mq.current_mq = mq.current_mq.replace(/"/g, "");
    mq.current_mq = mq.current_mq.replace(/'/g, "");

    if (mq.current_mq !== mq.media_query) {
        switch(mq.current_mq) {
        case "hdtv":
           mq.media_query = "hdtv";
		   $("#search_field").attr("placeholder","Search for your favorite Super Heroes!");
           break;
        case "desktop":
           mq.media_query = "desktop";
		   $("#search_field").attr("placeholder","Search for your favorite Super Heroes!");
           break;
        case "tablet":
            mq.media_query = "tablet";
			$("#search_field").attr("placeholder","Search for your favorite Super Heroes!");
            break;
        case "mobile":
           mq.media_query = "mobile";
		   $("#search_field").attr("placeholder","Search");
           break;
        }
    }
};

window.onresize = function() {
    mq.displayViewport();
    mq.displayMq();
};

mq.displayViewport();
mq.displayMq();