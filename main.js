// Global variables holding source node and destination node having an edge between them
var src = [];
var dst = [];

var Bc = 0.5; // Compactness threshold
var Bl = 0.4;

// Make this variable global so that at every point we know what central nodes are in consideration.
var centralNodes = [];

// var preProcessInputData = function(data) {
// 	// Create javaScript object as key -> Value pair of each edge
// 	data = data.split('\n');
// 	var processedData = {};
// 	$.each(data, function(index, value) {
// 		value = value.split('\t');
// 		processedData[index] = [value[0], value[1]];
// 	});
// 	return processedData;
// }

var getTotalNodes = function(src) {
	return Math.max(...src);
};

// Function to get all the inward edges of a node
var getInEdges = function(node) {

	var inEdges = [];

	for(var i = 0; i < dst.length; i++) {
		if(node == dst[i]) {
			if(src[i] != 0) {
				inEdges.push(src[i]);
			}
		}
	}

	return inEdges;

};

// Function to get all the Outward edges of a node
var getOutEdges = function(node) {

	var outEdges = [];

	for(var i = 0; i < src.length; i++) {
		if(node == src[i]) {
			if(dst[i] != 0) {
				outEdges.push(dst[i]);
			}
		}
	}

	return outEdges;

};

var getNeighbours = function(node) {
	var Tin = getInEdges(node);
	var Tout = getOutEdges(node);
	var nb = Tin;
	nb.push.apply(nb, Tout);
	return nb;
};

// na = neighbour array containing neighbours of each vertex in the community
var getCommunityNeighbours = function(c, na) {
	for(var i=0; i<na.length; i++) {
		na[i] = na[i].filter(function(val) {
  			return c.indexOf(val) == -1;
		});
	}
	mergedArray = [];
	for(var j=0; j<na.length; j++) {
		mergedArray = _.union(mergedArray, na[j]);
	}
	return mergedArray;
};

var getIntersection = function(an, bn) {
	var a = an.slice(0);
	var b = bn.slice(0);
	a.sort(function(a, b){return a-b});
	b.sort(function(a, b){return a-b});
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
	var vertexOutEdges = getOutEdges(v);
	var similarVertex = getIntersection(vertexOutEdges, c);
	var numerator = similarVertex + 1;
	return numerator/denominator;
};

var filterCommunity = function(c) {
	var filteredCommunity = [];
	for(var i=0; i<c.length; i++) {
		var denominator = getOutEdges(c[i]).length + 1;
		var vertexOutEdges = getOutEdges(c[i]);
		var similarVertex = getIntersection(vertexOutEdges, c);
		var numerator = similarVertex + 1;
		compactness = numerator/denominator;
		if(compactness > Bc) {
			filteredCommunity.push(c[i]);
		}
	}
	return filteredCommunity;
};

var getInitialCommunities = function() {

	// create nodes array
	var inDegrees = [];
	var maxInDegree = 0;
	var community = [];
	var allInitialCommunities = [];

	/*
	 * We assume the nodes are labelled in increasing order so we just get the max
	 * label and run a loop from 1 to max and treat every index in the loop as a node
	 *
	 * getTotalNodes(src) signifoes we are getting the total nodes in the network
	 *
	 */
	for(var i = 1; i <= getTotalNodes(src); i++) {
		inDegrees.push(getInEdges(i).length);
	}

	maxInDegree = Math.max(...inDegrees);

	/*
	 * Find central nodes around which initial community is calculated at first.
	 * Control this loop to get the expected central nodes.
	 */
	for(var i=0; i < inDegrees.length; i++) {
		if(maxInDegree == inDegrees[i]) {
			centralNodes.push(i+1);
		}
	}

	var currentCoreValues = getCoreValues();

	var maxCoreValue = Math.max(...currentCoreValues);

	var toleranceFactor = 0.15;

	for(var i=0; i < currentCoreValues.length; i++) {
		if((maxCoreValue > (currentCoreValues[i]-toleranceFactor)) && (maxCoreValue < (currentCoreValues[i]+toleranceFactor))) {
			// centralNodes.push(i+1);
		}
	}

	// Do calculations for each central node
	for(var i=0; i<centralNodes.length; i++) {
		community = getInEdges(centralNodes[i]);
		community.push.apply(community, (getOutEdges(centralNodes[i])));
		community.push(centralNodes[i]);
		// filter 0 (zero)
		for(var j = community.length - 1; j >= 0; j--) {
	    	if(community[j] === 0) {
	       		community.splice(j, 1);
	    	}
		}
		community = filterCommunity(community);
		allInitialCommunities.push(community);
	}

	return allInitialCommunities;

}

function nbForAllCommunities(c) {

	var nbForEachCommunity = [];

	// Expand each of the initial communities
	for(var i=0; i<c.length; i++) {

		var nbOfEachVertex = [];

		// Find neighbours of each vertex in the community
		for(var j=0; j<c[i].length; j++) {
			nbOfEachVertex.push(getNeighbours(c[i][j]));
		}
		nbForEachCommunity.push(getCommunityNeighbours(c[i], nbOfEachVertex));
	}

	return nbForEachCommunity;

};

var expandCommunities = function(c) {

	var Nv = [];
	var Nlv = [];

	var nbForEachCommunity = nbForAllCommunities(c);

	for(var i=0; i<nbForEachCommunity.length; i++) {
		var nbList = nbForEachCommunity[i];
		for(var j=0; j<nbList.length; j++) {
			var compactness = getCompactness(nbList[j], c[i]);
			if(compactness > Bc) {
				Nv.push(nbList[j]);
			} else if(compactness <= Bc && compactness >= Bl) {
				Nlv.push(nbList[j]);
			}
		}

		// Remove central nodes as they can't be a part of neighbours
		Nv = _.difference(Nv, centralNodes);
		Nlv = _.difference(Nlv, centralNodes);

		if(Nv.length != 0) {
			c[i].push.apply(c[i], Nv);
			Nv = [];
			expandCommunities(c);
		}

		if(Nlv.length != 0) {
			c[i].push.apply(c[i], Nlv);
			Nlv = [];
			expandCommunities(c)
		}

		if(Nv == 0 && Nlv == 0) {
			return;
		}

	}

	return;
};

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

function getCommonNodes(c1, c2) {
	var intersection = _.intersection(c1, c2);
	return intersection;
}

// Variable holding the object notation of array containing all the communities array.
var com;

// Load the directed acyclic graph file
$.ajax({
	url: "../directed_networks/network_100.dat",
	success: function (data) {

		// preProcessInputData(data);

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
		console.log("Computed core values: ", computedCoreValues);

		// Sort the core values array in decreasing order.
		computedCoreValues.sort(function(a, b){return b-a});

		// Find initial community
		var initialCommunities = getInitialCommunities();

		expandCommunities(initialCommunities);

		for(var i=0; i<initialCommunities.length; i++) {
			initialCommunities[i] = _.uniq(initialCommunities[i]);
		}

		com = initialCommunities.reduce(function(o, v, i) {
  			o[i] = v;
  			return o;
		}, {});

		var data = '';

		for (var key in com) {
			if (com.hasOwnProperty(key)) {
		    	var obj = com[key];
		    	for (var prop in obj) {
		        	if (obj.hasOwnProperty(prop)) {
		            	data = data + obj.join("\n") + "\n#\n";
		        	}
		    	}
			}
		}

		$.ajax({
			url: "write_communities.php",
			method: "POST",
			data: {data: data},
			success: function(data) {
				console.log(data);
			}
		})

		console.log("List of communities: ", com);

		console.log("To get common nodes, call 'getCommonNodes(com[0], com[1])'");

	}
});