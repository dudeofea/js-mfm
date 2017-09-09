$(window).load(function(){
	var grid_container = $("#grid");
	var height = 10;
	var width = 10;
	var tile_size = 30;
	for (var i = 0; i < height; i++) {
		for (var j = 0; j < width; j++) {
			var style = 'style="top: '+i*tile_size+'px;left: '+j*tile_size+'px;height: '+tile_size+'px;width: '+tile_size+'px;"';
			grid_container.append('<div class="tile" '+style+'></div>');
		}
	}
	var tiles = $("#grid .tile");
	for (var i = 0; i < tiles.length; i++) {
		tiles[i].top = tiles[i-width];
		tiles[i].bottom = tiles[i+width];
		tiles[i].left = tiles[i-1];
		tiles[i].right = tiles[i+1];
		tiles[i].onclick = add_atom_onclick;
	}
});
var latency = 50;

function add_atom_onclick(e){
	add_atom(e.target, do_nothing);
}

function add_atom(e, fn){
	if(!e){ return; }
	//set color
	$(e).css('background-color', "red");
	//run atom's function
	clearTimeout(e.timeout);
	e.timeout = setTimeout(fn.bind(null, e, function(){
		//reset color
		$(e).css('background-color', "");
	}), latency);
}

function do_nothing(e, callback){
	add_atom(e.top, do_nothing);
	callback();
}
