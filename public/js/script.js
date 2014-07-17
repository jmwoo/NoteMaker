$(function () {
  // common elements
  var $textInput = $('#input-text');
  var $tagInput = $('#input-tags');
  var $textList = $('#entries');
  var $searchTags = $('#search-tags');
  var $searchText = $('#search-text');
  var settings;

  // events
  $textInput.on('keydown', function (e) {
    if (e.which === 13) {
      e.preventDefault();
      var text = $(this).val().trim();
      if (text !== '') {
      	var entry = {text: text};
      	var tagStr = $tagInput.val().trim();
      	if (tagStr !== '') {
      		entry.tagStr = tagStr;
      	}
        submitEntry(entry);
      }
      $(this).val('');
    }
  });

  $tagInput.on('keydown', function (e) {
  	if (e.which === 13) {
  		e.preventDefault();
  	}
  });

  $searchText.on('keydown', function (e) {
  	if (e.which === 13) {
  		search(e);
  	}
  });

  $searchTags.on('keydown', function (e) {
  	if (e.which === 13) {
  		search(e);
  	}
  });

  // get entries on load
  $.get('/entries', function (data) {
  	settings = data.settings;
    data.entries.forEach(function (entry) {
      addEntry(entry);
    });
  });

  var submitEntry = function (entry) {
  	$.post('/send', entry)
  		.done(function (data) {
        addEntry(data);
  	}).fail(function () {
  		console.log('could not post data...');
  	});
  };

  var addEntry = function (entry) {
  	entry.prettyDate = moment(entry.timestamp).format(settings.dateFormatStr);
  	if (entry.tags)
  		entry.hasTags = true;
  	else
  		entry.hasTags = false;
  	console.log(entry);
  	var html = ich.entry(entry);
    $textList.prepend(html);
  };

  var search = function (e) {
  	e.preventDefault();
  	var searchText = $searchText.val().trim();
  	var searchTags = $searchTags.val().trim();

  	if (searchText === '' && searchTags === '')
  		return;

  	var searchObj = {searchText: $searchText.val(), searchTags: $searchTags.val()};
  	$('#entries').empty();
  	$('.panel-title').text("Search: " + "text='" + searchObj.searchText + "', tags='" + searchObj.searchTags + "'");
  	$.post('/search', searchObj)
  		.done(function (data) {
  			data.entries.forEach(function (entry) {
  				addEntry(entry);
  			});
  		}).fail(function () {
  			console.log('could not do search...');
  		});
  };

});