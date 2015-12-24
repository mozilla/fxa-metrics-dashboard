$.getJSON( "out.json", function( data ) {
  var items = [];
  $.each( data, function( key, val ) {
    items.push("<a target='_blank' href='" + val + "'><img src='" + val  +"' id='dash" + key + "'/></a>");
  });

  $('#placeholder').html(items)

});