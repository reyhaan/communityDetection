// Global variables holding source node and destination node having an edge between them
var src = [];
var dst = [];

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

var getCoreValues = function() {
	var coreValues = [];
	for(var i = 1; i <= getTotalNodes(src); i++) {
		var inEdges = getInEdges(i);
		var coreValue = 0;
		for(var j = 0; j < inEdges.length; j++) {
			coreValue += ((getIntersection(inEdges, getInEdges(inEdges[j]))) / inEdges.length);
		}

		coreValues.push(coreValue);
	}

	return coreValues;
};

var getCompactness = function(v, c) {
	var denominator = getOutEdges(v).length + 1;
	console.log(denominator);
};

var getInitialCommunity = function() {
	// create nodes array
	var inDegrees = [];
	var maxInDegree = 0;
	var community = [];
	for(var i = 1; i <= getTotalNodes(src); i++) {
		inDegrees.push(getInEdges(i).length);
	}

	var maxIndegreeVertex = inDegrees.indexOf(Math.max.apply(Math, inDegrees)) + 1;

	community = getInEdges(maxIndegreeVertex);
	community.push.apply(community, (getOutEdges(maxIndegreeVertex)));
	community.push(maxIndegreeVertex);

	// filter 0 (zero)
	for(var i = community.length - 1; i >= 0; i--) {
    	if(community[i] === 0) {
       		community.splice(i, 1);
    	}
	}

	return community;

}

var getSimilarityIndex = function(u, v) {

	var Tu = [],
		Tv = [];

	var TuIn = getInEdges(u);
	var TuOut = getOutEdges(u);
	Tu = TuIn;
	Tu.push.apply(Tu, TuOut);
	Tu.push(u);

	var TvIn = getInEdges(v);
	var TvOut = getOutEdges(v);
	Tv = TvIn;
	Tv.push.apply(Tv, TvOut);
	Tv.push(v);

	var numerator = getIntersection(Tu, Tv);

	var denominator = Math.pow((Tu.length * Tv.length), 0.5);

	return numerator/denominator;

}

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

		var computedCoreValues = getCoreValues();

		// Display the core values in console.
		console.log(computedCoreValues);

		// Sort the core values array in decreasing order.
		computedCoreValues.sort(function(a, b){return b-a});

		// Find initial community
		console.log(src)
		console.log(dst)

	}
});