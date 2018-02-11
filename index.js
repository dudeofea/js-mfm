$(window).load(function(){
	//create the grid
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
	//load all tile element and link to each other
	var tiles = $("#grid .tile");
	for (var i = 0; i < tiles.length; i++) {
		tiles[i].top = tiles[i-width];
		tiles[i].bottom = tiles[i+width];
		if(i%width > 0)
			tiles[i].left = tiles[i-1];
		if(i%width < width - 1)
			tiles[i].right = tiles[i+1];
		tiles[i].onclick = add_atom_onclick;
		tiles[i].x = i % width;
		tiles[i].y = Math.floor(i / width);
	}
	//add all atom functions to sidebar menu
	var legend = $("#atom-legend");
	var atoms = [
		resource,
		regulator,
		sandbox
	];
	for (var i = 0; i < atoms.length; i++) {
		legend.append('<li><div class="color-icon" style="background-color:'+atoms[i].color+'"></div>'+atoms[i].name+'</li>');
	}
	var legend_elem = legend.children();
	for (var i = 0; i < legend_elem.length; i++) {
		legend_elem[i].atom_fn = atoms[i];
		legend_elem[i].onclick = select_atom_onclick;
	}
	selected = resource
});
var latency = 10;
var selected;

//select an atom from legend
function select_atom_onclick(e){
	selected = e.target.atom_fn;
}
//add an atom to an element via UI
function add_atom_onclick(e){
	add_atom(e.target, selected);
}
//add an atom to an element (deletes whatever's currently there)
function add_atom(e, atom){
	if(!e || !atom || !atom.run){ return; }
	//set color
	$(e).css('background-color', atom.color);
	//run atom's function
	clearTimeout(e.timeout);
	e.atom = JSON.parse(JSON.stringify(atom));
	e.atom.run = atom.run;
	e.timeout = setTimeout(e.atom.run.bind(e.atom, e, function(){
		add_atom(e, e.atom);
	}), latency);
}
//clear an element of anything in it
function delete_atom(e){
	if(!e){ return; }
	clearTimeout(e.timeout);
	e.atom = null;
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
		add_atom(sel, e.atom);
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
function create_random(e, atom){
	add_atom(pick_random(e), atom);
}
//returns true p percent of the time (p is from 0-1)
function prob(p){
	return Math.random() < p;
}

//moves randomly, does nothing
var resource = {
	name: "resource",
	run: function(e, callback){
		move_random(e);
		callback();
	},
	color: "#50514F"
}
//spawns resource, sometimes duplicates
var regulator = {
	name: "regulator",
	run: function(e, callback){
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
	},
	color: "#5BC3EB"
}
//contains things in a box
var sandbox = {
	name: "sandbox",
	run: function(e, callback){
		//get our index
		if(this.x == null){
			if(e.left && e.left.atom && e.left.atom.name == "sandbox" && e.left.atom.x != null){
				this.x = e.left.atom.x + 1
			}else{
				this.x = 0;
			}
		}
		if(this.y == null){
			if(e.top && e.top.atom && e.top.atom.name == "sandbox" && e.top.atom.y != null){
				this.y = e.top.atom.y + 1
			}else{
				this.y = 0;
			}
		}
		//if we are a horizontal member
		if(this.x > 0 || (this.x == 0 && this.y == 0)){
			//if we are the last horizontal member
			if(this.x == this.width - 1){
				//add an atom if bottom not full
				if(e.bottom && e.bottom.atom == null){
					add_atom(e.bottom, sandbox);
				}
			}else if(this.x < this.width - 1){
				//add an atom if right not full and we haven't reached our width
				if(e.right && e.right.atom == null){
					add_atom(e.right, sandbox);
				}
			}
		}
		//if we are a vertical member
		if(this.y > 0 || (this.x == 0 && this.y == 0)){
			//if we are the last vertical member
			if(this.y == this.height - 1){
				//add an atom if right not full
				if(e.right && e.right.atom == null){
					add_atom(e.right, sandbox);
				}
			}else if (this.y < this.height - 1){
				//add an atom if bottom not full and we haven't reached our height
				if(e.bottom && e.bottom.atom == null){
					add_atom(e.bottom, sandbox);
				}
			}
		}
		callback();
	},
	color: "#F06449",
	height: 8,
	width: 8
}
