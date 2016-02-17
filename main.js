// Global variables holding source node and destination node having an edge between them
var src = [];
var dst = [];
var coreValues = {};

var getTotalNodes = function(src) {
	return Math.max(...src);
};

// Function to get all the inward edges of a node
var getInEdges = function(node) {

	var inEdges = [];

	for(var i = 0; i < dst.length; i++) {
		if(node == dst[i]) {
			inEdges.push(src[i]);
		}
	}

	return inEdges;

};

// Function to get all the Outward edges of a node
var getOutEdges = function(node) {

	var outEdges = [];

	for(var i = 0; i < src.length; i++) {
		if(node == src[i]) {
			outEdges.push(dst[i]);
		}
	}

	return outEdges;

};

var getIntersection = function(a, b) {
	a.sort();
	b.sort();
	var ai=0, bi=0;
	var result = new Array();

	while( ai < a.length && bi < b.length ) {
		if(a[ai] < b[bi]) {
			ai++;
		}
		else if(a[ai] > b[bi] ){
			bi++;
		} else /* they're equal */ {
			result.push(a[ai]);
			ai++;
			bi++;
		}
	}
	return result.length;
}

var computeCoreValues = function() {
	for(var i = 1; i <= getTotalNodes(src); i++) {
		var inEdges = getInEdges(i);
		var coreValue = 0;
		for(var j = 0; j < inEdges.length; j++) {
			coreValue += ((getIntersection(inEdges, getInEdges(inEdges[j]))) / inEdges.length);
		}

		coreValues[i] = coreValue;
	}
};

// Load the directed acyclic graph file
$.ajax({
	url: "dag.txt",
	success: function (data) {

		data = data.split('\n');

		$.each(data, function(index, value) {

			value = value.split('\t');

			src.push(parseInt(value[0]));

			if(value.length == 1) {
				dst.push(0);
			} else {
				dst.push(parseInt(value[1]));
			}

		});

		computeCoreValues();

		console.log(coreValues);

	}
});