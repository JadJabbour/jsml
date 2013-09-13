/**************************************************/
/*Machine Learning & Other Algorithms in Javacript*/
/**************************************************/

//the jsML namespace
var jsML = {};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////
//k-nearest-neighbor 
////////////////////////////////////////////

//the jsML.kNN object namespace
jsML.kNN = {};

//dimensions definition 
jsML.kNN.buildDimensionList = function(string){
	this.dimensions = [];
	var list = string.split(',');
	for(var i = 0 ; i < list.length ; i++){
		this.dimensions.push({ 
			description : list[i].split('|')[0], 
			priority : list[i].split('|')[1]//the lower this is the higher this dimension's effect will be
		});
	}
	return this;
};

//the node object
jsML.kNN.node = function(input) {
	for (var key in input){
		this[key] = input[key];
	}
	this.neighbors = [];
	return this;
};

//calculates the distance from neighbors 
jsML.kNN.node.prototype.calculateNeighborDistances = function() {
	var deltaDistance = 0;
	var dimensions = jsML.kNN.dimensions;
	var tempNum;
	this.neighbors.distances = [];
	for(var j = 0 ; j < this.neighbors.length ; j++){
		tempNum = 0;
		for(var n = 0 ; n < dimensions.length ; n++){
			deltaDistance = ((this.neighbors[j][dimensions[n].description] - this[dimensions[n].description]) / (dimensions[n].range * dimensions[n].priority));
			tempNum += deltaDistance * deltaDistance;
		}
		this.neighbors[j].distance = Math.sqrt(tempNum);
	}
	return this.sortNeighbors();
};

//sorts a node's neighbor according to distance
jsML.kNN.node.prototype.sortNeighbors = function() {
	this.neighbors.sort(function(nodeA, nodeB) {
		return nodeA.distance - nodeB.distance;
	});
	return this;
};

//identifies a type-less or unknown node
jsML.kNN.node.prototype.identify = function(width) {
	var widths = 0, selectedNeighbors;
	var types = {};
	var tempName = '';
	if(!this.type){
		widths = !width ? 3 : width;
		selectedNeighbors = this.neighbors.slice(0, widths);
		for(var i = 0 ; i < selectedNeighbors.length ; i++){
			if(!types[selectedNeighbors[i].type]){
				tempName = selectedNeighbors[i].type;
				eval("types." + tempName + "=1");
			}
			else{
				types[selectedNeighbors[i].type]++;
			}
		}
		for(var key in types){
			types[key] = ((types[key]/width)*100);
		}
		this.type = types;
		return types;
	}
	else{
		return this.type;
	}
};

//the nodelist object
jsML.kNN.nodeList = function(){
	this.nodes = [];
	this.width = 0;
	return this;
};

//adds a node to the list
jsML.kNN.nodeList.prototype.addNode = function(node){
	this.nodes.push(node);
};

//calculates the preferable K (width of comparison)
jsML.kNN.nodeList.prototype.calculateK = function(){
	var types = {};
	var lowest = 0;
	for(var i = 0 ; i < this.nodes.length ; i++){
		if(!this.nodes[i].type){
			continue;
		}
		if(!types[this.nodes[i].type]){
			eval("types." + this.nodes[i].type + "=1");
		}
		else{
			types[this.nodes[i].type]++;
		}
	}
	for(var key in types){
		lowest = types[key] < lowest || lowest == 0 ? types[key] : lowest;
	}
	this.width = lowest;
	return lowest;
};

//calculates the ranges for the dimensions
jsML.kNN.nodeList.prototype.calculateRanges = function(){
	var dimensions = jsML.kNN.dimensions;
	var tempMax, tempMin;
	for(var n = 0 ; n < dimensions.length ; n++){
		tempMax = 0;
		tempMin = 0;
		for(var j = 0 ; j < this.nodes.length ; j++){
			if(this.nodes[j][dimensions[n].description] > tempMax){
				tempMax = this.nodes[j][dimensions[n].description];
			}

			if(this.nodes[j][dimensions[n].description] < tempMax){
				tempMin = this.nodes[j][dimensions[n].description];
			}
		}
		dimensions[n].range = tempMax - tempMin;
	}
	return this;
};

//identifies unknown nodes and tries to guess their type
jsML.kNN.nodeList.prototype.identifyUnknownNodes = function(output){
	this.calculateK();
	this.calculateRanges();
	for(var i = 0 ; i < this.nodes.length ; i++){
		if(!this.nodes[i].type){
			this.nodes[i].neighbors = [];
			for (var j = 0 ; j < this.nodes.length ; j++)
			{
				if (!this.nodes[j].type){
					continue;
				}
				this.nodes[i].neighbors.push(new jsML.kNN.node(this.nodes[j]));
			}
			output(this.nodes[i].calculateNeighborDistances().identify(this.width));
		}
	}
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////
//DFS Search 
////////////////////////////////////////////

//the jsML.dfs object namespace
jsML.dfs = {};

//The node object
jsML.dfs.node = function(id, value){
	this.id = id;
	this.value = value;
	this.neighbors = [];
	return this;
};

//adds a neighbor node
jsML.dfs.node.prototype.addNeighbor = function(neighborNode){
	this.neighbors.push(neighborNode);
};

//calculates the shortest path from this to passed node
jsML.dfs.node.prototype.pathTo = function(node, checkedList){
	var paths = [];
	var passList = [];
	if(!checkedList){
		passList.push(this);
	}
	else{
		passList = checkedList;
	}
	for(var i = 0 ; i < this.neighbors.length ; i++){
		var tempPath = [];
		if(this.neighbors[i].isSame(node)){
			tempPath.push(this.neighbors[i]);
			paths.push(tempPath);
			break;
		}
		else{
			if(this.neighbors[i].isInList(passList)){
				paths.push(tempPath);
				continue;
			}
			else{
				passList.push(this.neighbors[i]);
				var downPath = this.neighbors[i].pathTo(node, passList);
				tempPath.push(this.neighbors[i]);
				for(var j = 0 ; j < downPath.length ; j++){
					tempPath.push(downPath[j]);
				}
				paths.push(tempPath);
			}
		}
	}

	if(paths.length > 0){
		paths.sort(function(a, b){
			return a.length - b.length;
		});
		for(var n = 0 ; n < paths.length ; n++){
			if(node.isInList(paths[n])){
				return paths[n]
			}
		}
		return paths[0];
	}
	else{
		return paths;
	}
};

//checks if this and the passed node are the same
jsML.dfs.node.prototype.isSame = function(node){
	return this.id === node.id;
};

//checks if this node is in the passed list
jsML.dfs.node.prototype.isInList = function(passedList){
	for(var i = 0 ; i < passedList.length ; i++){
		if(this.isSame(passedList[i])){
			return true;
		}
	}
	return false;
};

//the Node Population object
jsML.dfs.nodePopulation = function(){
	this.nodes = [];
};

//adds a node to the population
jsML.dfs.nodePopulation.prototype.addNode = function(node){
	this.nodes.push(node);
};

//finds the shortest path between 2 nodes in the population
jsML.dfs.nodePopulation.prototype.findLink = function(node1, node2){
	if(this.checkExist(node1) && this.checkExist(node2)){
		var trail = node1.pathTo(node2, null);		
		return trail.length == 0 ? null : trail;
	}
	else{
		console.log("One of the nodes you entered is not in the population.");
		return null;
	}
};

//checks if a node exists in the population
jsML.dfs.nodePopulation.prototype.checkExist = function(node){
	for(var i = 0 ; i < this.nodes.length ; i++){
		if(this.nodes[i].isSame(node)){
			return true;
		}
	}
	return false;
};

//gets a node from the population by ID
jsML.dfs.nodePopulation.prototype.findNode = function(id){
	for(var i = 0 ; i < this.nodes.length ; i++){
		if(this.nodes[i].id == id){
			return this.nodes[i];
		}
	}
	return null;
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////
//Sieve of Eratosthenes
////////////////////////////////////////////

//the jsML.SoE function
jsML.SoE = function(maxNumber){
	var collection = [];

	var _fillCollection = function(max){
		for(var i = 2; i <= max; i++){
			collection.push(i);
		}
	};

	var _removeMultiples = function(number, max){
		var index = -1;
		for(var i = 2; true; i++){
			index = collection.indexOf(number*i);
			if(index > -1){
				collection.splice(index, 1);
			} 
			if((number*i) > collection[collection.length-1]){
				break;
			}
		}
	};

	_fillCollection(maxNumber);
	for(var i=0; i<collection.length; i++){
		_removeMultiples(collection[i], maxNumber);
	}

	return collection;
};