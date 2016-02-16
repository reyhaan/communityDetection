// Global variables holding source node and destination node having an edge between them
var src = [];
var dst = [];

// Function to get all the inward edges of a node
var getInEdge = function(node) {

};

// Function to get all the Outward edges of a node
var getOutEdge = function(node) {

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

		console.log(src, dst);

	}
});