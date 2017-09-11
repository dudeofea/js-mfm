$(window).load(function(){
	var grid_container = $("#grid");
	var height = 30;
	var width = 30;
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
	if(!e || !fn){ return; }
	//set color
	$(e).css('background-color', fn.color);
	//run atom's function
	clearTimeout(e.timeout);
	e.fn = fn;
	e.timeout = setTimeout(fn.bind(null, e, function(){
		add_atom(e, e.fn);
	}), latency);
}
//clear an element of anything in it
function delete_atom(e){
	if(!e){ return; }
	clearTimeout(e.timeout);
	e.fn = null;
	e.timeout = null;
	$(e).css('background-color', '');
}
//pick a random direction around us, can be null
function pick_random(e){
	var directions = ["top", "bottom", "left", "right"];
	return e[directions[Math.floor(Math.random() * directions.length)]];
}
//move to a random spot, if you can
function move_random(e){
	var sel = pick_random(e);
	if(sel && sel.timeout == null){
		add_atom(sel, e.fn);
		delete_atom(e);
	}
}
//randomly delete a random element around you
function delete_random(e){
	var sel = pick_random(e);
	if(sel){
		clearTimeout(sel.timeout);
		$(sel).css('background-color', "");
		sel.timeout = null;
	}
}
//create an atom in a random spot around you
function create_random(e, fn){
	add_atom(pick_random(e), fn);
}
//returns true p percent of the time (p is from 0-1)
function prob(p){
	return Math.random() < p;
}

//moves randomly, does nothing
function resource(e, callback){
	move_random(e);
	callback();
}
resource.color = "#50514F";
//spawns resource, sometimes duplicates
function regulator(e, callback){
	if(prob(0.1)){
		create_random(e, resource);
	}
	if(prob(0.005)){
		create_random(e, regulator);
	}
	if(prob(0.05)){
		delete_random(e);
	}
	move_random(e);
	callback();
}
regulator.color = "#5BC3EB";
