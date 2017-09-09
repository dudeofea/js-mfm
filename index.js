$(window).load(function(){
	var neurons = [];
	var links = [];
	var sequence_list = [];
	var cur_offset = null;
	var cur_elem = null;
	var create_link = false;
	//start drag
	var neuron_mousedown = function(e){
		var target = $(e.target);
		if(create_link){
			//create a link from last neuron to current
			create_link = false;
			create_link_func(neurons[cur_elem-1].elem, target);
		}
		//set this as the current element
		cur_elem = parseInt(target.attr('id').replace('neuron-', ''));
		$('neuron').removeClass('highlight');
		neurons[cur_elem-1].elem.addClass('highlight');
		//update offset
		var elem_o = neurons[cur_elem-1].elem.offset();
		cur_offset = {x: elem_o.left - e.pageX, y: elem_o.top - e.pageY};
	};
	//during drag
	$(window).on('mousemove', function(e){
		if(cur_offset == null || cur_elem == null){ return; }
		var id = cur_elem;
		var elem_o = {left: cur_offset.x + e.pageX, top: cur_offset.y + e.pageY}
		neurons[id-1].elem.css({top: elem_o.top+'px', left: elem_o.left+'px'});
		neurons[id-1].offset = elem_o;
		//update outgoing arrow position
		for (var i = 0; i < neurons[id-1].out.length; i++) {
			update_arrow_func(neurons[id-1].out[i]);
		}
		//update incoming arrow positions
		for (var i = 0; i < links.length; i++) {
			if(links[i].b == id){
				update_arrow_func(i+1);
			}
		}
	//end drag
	}).on('mouseup', function(){
		cur_offset = null;
	//keyboard events
	}).on('keypress', function(e){
		if(e.which == 110){	//N key
			//insert neuron, bind event
			var id = neurons.push({out: [], elem: null, timeout: null, offset: null});
			var elem = $('<neuron id="neuron-'+id+'"><input type="text"/></neuron>');
			$('body').append(elem);
			neurons[id-1].elem = elem;
		}else if(e.which == 109){	//M key
			//create a link
			if(cur_elem == null){ return; }
			create_link = true;
		}else if(e.which == 32){	//Space bar
			//fire the selected neuron
			if(cur_elem == null){ return; }
			fire_neuron(cur_elem);
		}else if(e.which == 100){	//D key
			//delete a neuron
			if(cur_elem == null){ return; }
			neurons[cur_elem-1].elem.remove();
			neurons.splice(cur_elem-1, 1);
			//convert link ids
			for (var i = 0; i < links.length; i++) {
				//remove links to / from
				if(links[i].a == cur_elem || links[i].b == cur_elem){
					links[i].elem.remove();
					links.splice(i, 1);
					i--;
					//go through neurons and fix id's of out
					for (var j = 0; j < neurons.length; j++) {
						for (var h = 0; h < neurons[j].out.length; h++) {
							if(neurons[j].out[h] == i){
								neurons[j].out.splice(h, 1);
								h--;
								continue;
							}
							if(neurons[j].out[h] > i + 1){
								neurons[j].out[h] -= 1;
							}
						}
					}
					continue;
				}
				//shift ids of other links
				if(links[i].a >= cur_elem){ links[i].a--; }
				if(links[i].b >= cur_elem){ links[i].b--; }
			}
			//redo neuron / arrow id's in DOM
			for (var i = 0; i < neurons.length; i++) {
				neurons[i].elem.attr('id', 'neuron-'+(i+1));
			}
			for (var i = 0; i < links.length; i++) {
				links[i].elem.attr('id', 'arrow-'+(i+1));
			}
		}else if (e.which == 115) {		//S key
			if(cur_elem == null){ return; }
			add_to_sequence(0, cur_elem);
		}
	//cancel selection / start selection
	}).on('mousedown', function(e){
		var target = $(e.target);
		if(target.is('neuron')){
			neuron_mousedown(e);
		}else{
			//cancel selection
			cur_elem = null;
			create_link = false;
			$('neuron').removeClass('highlight');
		}
	//save data in localstorage when closing
	}).on('beforeunload', function(){
		localStorage.setItem('data', JSON.stringify({
			neurons: neurons,
			links: links,
			sequence_list: sequence_list
		}));
	});
	//clear sequence list
	$('#clear').click(function(){
		sequence_list = [];
		update_sequence_list();
	});
	//run the sequence
	$('#run').click(function(){
		for (var i = 0; i < sequence_list.length; i++) {
			setTimeout(
				fire_neuron,
				sequence_list[i].timeout,
				sequence_list[i].id
			);
		}
	});
	//create a link between two neurons
	var create_link_func = function(na, nb){
		//add link to array
		var aid = parseInt(na.attr('id').replace('neuron-', ''));
		var bid = parseInt(nb.attr('id').replace('neuron-', ''));
		var id = links.push({elem: null, a: aid, b: bid, offset: null, strength: 0.1});
		neurons[aid-1].out.push(id);
		//add an arrow between elements
		var arrow = $('<arrow id="arrow-'+id+'"></arrow>');
		$('body').append(arrow);
		//add element to array
		links[id-1].elem = arrow;
		//update position
		update_arrow_func(id);
	};
	var update_arrow_func = function(id){
		//get elements
		var arrow = links[id-1].elem;
		var na = neurons[links[id-1].a-1].elem;
		var nb = neurons[links[id-1].b-1].elem;
		//get centers
		var na_offset = neurons[links[id-1].a-1].offset;
		var na_center = {left: na_offset.left + na.width() / 2, top: na_offset.top + na.height() / 2};
		var nb_offset = neurons[links[id-1].b-1].offset;
		var nb_center = {left: nb_offset.left + nb.width() / 2, top: nb_offset.top + nb.height() / 2};
		var pa = na_center;
		var pb = nb_center;
		//update arrow position
		var xdiff = pb.left - pa.left;
		var ydiff = pb.top - pa.top;
		var angle = Math.atan2(ydiff, xdiff);
		var mag = Math.sqrt(xdiff*xdiff+ydiff*ydiff) - 38;
		var a_offset = {
			left: pa.left - (mag/2)*(1-Math.cos(angle)),
			top:  pa.top + (mag/2)*Math.sin(angle)
		}
		links[id-1].offset = a_offset;
		arrow.css({top: a_offset.top+'px', left: a_offset.left+'px'});
		arrow.width(mag);
		arrow.rotate(angle);
	}
	//fire the neuron with the given id
	var fire_start_time = 100;
	var fire_stop_time = 200;
	var refresh_time = 50;
	var fire_neuron = function(id){
		//if not ready, don't fire
		if(neurons[id-1].timeout != null){
			return;
		}
		//firing timeout
		clearTimeout(neurons[id-1].timeout);
		neurons[id-1].timeout = setTimeout(function(nid){
			setTimeout(function(nnid){
				neurons[nnid-1].timeout = null;
			}, refresh_time, nid);
			neurons[nid-1].elem.removeClass('fire');
		}, fire_stop_time, id);
		//fire the neuron
		neurons[id-1].elem.addClass('fire');
		//show firing radius
		var radius_elem = $('<firing-radius></firing-radius>');
		$('body').append(radius_elem);
		radius_elem.css({top: (neurons[id-1].offset.top+30)+'px', left: (neurons[id-1].offset.left+30)+'px'});
		//trigger the radius, then hide
		setTimeout(function(r){
			r.addClass('fire');
		}, fire_start_time, radius_elem);
		setTimeout(function(r){
			r.remove();
		}, 1000, radius_elem);
		//randomly make a connection to another neuron
		var r = parseInt(Math.random()*(neurons.length)*4) + 1;
		if(r <= neurons.length){
			//check if we already have it / is invalid
			var haveit = false;
			for (var i = 0; i < links.length; i++) {
				if((links[i].a == id && links[i].b == r) || (links[i].a == r && links[i].b == id) || r == id){
					haveit = true;
				}
			}
			if(!haveit){
				//add it
				create_link_func(neurons[id-1].elem, neurons[r-1].elem);
			}
		}
		//fire outgoing links
		for (var i = 0; i < neurons[id-1].out.length; i++) {
			setTimeout(function(nid){
				fire_neuron(nid)
			}, fire_start_time, links[neurons[id-1].out[i]-1].b);
		}
	};
	//add neuron to sequence
	var add_to_sequence = function(time, id){
		//if list is empty
		if(sequence_list.length == 0){
			$('.sequence-list').html('');
		}
		//check if element exists
		for (var i = 0; i < sequence_list.length; i++) {
			if(sequence_list[i].id == id && sequence_list[i].timeout == time){
				return;
			}
		}
		sequence_list.push({id: id, timeout: time});
		update_sequence_list();
	}
	//update the list when a new element is inserted / changed
	var update_sequence_list = function(){
		//show message when empty
		if(sequence_list.length == 0){
			$('.sequence-list').html('<li class="text">Press S to sequence a neuron</li>');
			return;
		}
		//resort list and reinsert into DOM
		sequence_list.sort(function(a, b){
			return a.timeout - b.timeout;
		});
		var str = "";
		for (var i = 0; i < sequence_list.length; i++) {
			sequence_list[i]
			str += '<li><input type="text" class="time" value="'+sequence_list[i].timeout+'">Neuron '+sequence_list[i].id+'</li>';
		}
		$('.sequence-list input.time').off('change');
		$('.sequence-list').html(str);
		//re-update when changing timeout values
		$('.sequence-list input.time').on('change', function(){
			var index = $(this).parent().index();
			var val = parseInt($(this).val()) || 0;
			sequence_list[index].timeout = val;
			update_sequence_list();
		});
	}
	//load neurons if possible
	if(localStorage && localStorage.getItem('data')){
		var data = JSON.parse(localStorage.getItem('data'));
		console.log(data);
		//re-init neurons
		for (var i = 0; i < data.neurons.length; i++) {
			//add new neuron to array
			var id = neurons.push({out: [], elem: null, timeout: null, offset: data.neurons[i].offset});
			var elem = $('<neuron id="neuron-'+id+'"><input type="text"/></neuron>');
			$('body').append(elem);
			elem.css({top: data.neurons[i].offset.top+'px', left: data.neurons[i].offset.left+'px'});
			neurons[id-1].elem = elem;
		}
		//re-init links
		for (var i = 0; i < data.links.length; i++) {
			create_link_func(
				neurons[data.links[i].a-1].elem,
				neurons[data.links[i].b-1].elem
			);
			links[links.length-1].offset = data.links[i].offset;
			links[links.length-1].elem.css({top: data.links[i].offset.top+'px', left: data.links[i].offset.left+'px'});
		}
		//re-init sequence
		sequence_list = data.sequence_list;
		if(sequence_list == null){
			sequence_list = [];
		}
		update_sequence_list();
	}
});

//rotate function
jQuery.fn.rotate = function(radians) {
    $(this).css({'-webkit-transform' : 'rotate('+ radians +'rad)',
                 '-moz-transform' : 'rotate('+ radians +'rad)',
                 '-ms-transform' : 'rotate('+ radians +'rad)',
                 'transform' : 'rotate('+ radians +'rad)'});
    return $(this);
};
