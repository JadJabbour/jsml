/******************************************/
/*Machine Learning Algorithms in Javacript*/
/******************************************/

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
		this.neighbors = [];
	}

	//calculates the distance from neighbors 
	this.calculateNeighborDistances = function() {
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
	this.sortNeighbors = function() {
		this.neighbors.sort(function(n1, n2) {
			return n1.distance - n2.distance;
		});
		return this;
	};

	//identifies a type-less or unknown node
	this.identify = function(width) {
		var widths = 0, selectedNeighbors;
		var types = {};
		var tempName = '';
		if(!this.type){
			widths = !width ? 3 : width;
			selectedNeighbors = this.neighbors.slice(0, widths);
			for(var i = 0 ; i < selectedNeighbors.length ; i++){
				if(!types[selectedNeighbors[i].type]){
					tempName = selectedNeighbors[i].type;
					//this is ugly i know, but i got over it and so should you :P
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
	return this;
};

//the nodelist object
jsML.kNN.nodeList = function(width){
	this.nodes = [];
	this.width = width;

	//adds a node to the list
	this.addNode = function(node){
		this.nodes.push(node);
	};

	//calculates the preferable K (width of comparison)
	this.calculateK = function(){
		//i still have no idea what to do here to get the optimal K
	};

	//calculates the ranges for the dimensions
	this.calculateRanges = function(){
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
	this.identifyUnknownNodes = function(output){
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

	return this;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////