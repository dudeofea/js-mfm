$(window).load(function(){
	var grid_container = $("#grid");
	var height = 20;
	var width = 20;
	var tile_size = 20;
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
		if(i%width > 0)
			tiles[i].left = tiles[i-1];
		if(i%width < width - 1)
			tiles[i].right = tiles[i+1];
		tiles[i].onclick = add_atom_onclick;
	}
	console.log(tiles);
});
var latency = 50;

//add an atom to an element via UI
function add_atom_onclick(e){
	add_atom(e.target, regulator);
}
//add an atom to an element (deletes whatever's currently there)
function add_atom(e, fn){
	if(!e){ return; }
	//set color
	$(e).css('background-color', fn.color);
	//run atom's function
	clearTimeout(e.timeout);
	e.timeout = setTimeout(fn.bind(null, e, function(){
		//reset element
		$(e).css('background-color', "");
		e.timeout = null;
	}), latency);
}
//copy atom to a random element around them
function copy_random(e, fn){
	var directions = ["top", "bottom", "left", "right"];
	var next = e[directions[Math.floor(Math.random() * directions.length)]];
	if(next && next.timeout == null){
		add_atom(next, fn);
	}else{
		add_atom(e, fn);
	}
}
//returns true p percent of the time (p is from 0-1)
function prob(p){
	return Math.random() < p;
}

//moves randomly, does nothing
function resource(e, callback){
	copy_random(e, resource);
	callback();
}
resource.color = "#50514F";
//spawns resource, sometimes duplicates
function regulator(e, callback){
	if(prob(0.2)){
		copy_random(e, resource);
	}
	if(prob(0.1)){
		copy_random(e, regulator);
	}
	copy_random(e, regulator);
	callback();
}
regulator.color = "#5BC3EB";
