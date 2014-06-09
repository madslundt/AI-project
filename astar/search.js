var search = {
    /**
     * A star search algorithm
     * @param  {(x,y)-coordinates} start [description]
     * @param  {(x,y)-coordinates} end   [description]
     * @param  {Map from the parser} map   [description]
     */
    astar: function(start, goal, map, debug) {
        if (debug) {
            console.log('------------------------Find path---------------------------');
        }

        if (map.length < 1) {
            console.log('error');
            return;
        }

        var closedset = [];
        var openset = [];
        var node = {
            "name": start.name,
            "node": start.start,
            "g": 0,
            "f": this.heuristic(start.start, goal),
            "from": null
        };
        openset.push(node);

        var ret = false;
        var count = 0;
        var current;
        var currentIndex;
        var current_path = [];
        while (openset.length > 0) {
            currentIndex = 0;
            current = openset[currentIndex];
            for (var i = 1; i < openset.length; i++) { // Finding lowest f value in openset.
                if (openset[i].f < current.f) {
                    currentIndex = i;
                }
            }

            current = openset[currentIndex];

            // Checking if we are at the goal
            if (this.isNodeEquals(current.node, goal)) {
                current_path = this.pathTo(current);
                ret = true;
                break;
            }

            if (debug) {
                console.log('\n::::::::::::::::' + count + ':::::::::::::::');
                console.log('--------------Current node-----------------');
                console.log('\t' + this.nodeString(current, goal));
            }

            // Remove current from openset.
            openset.splice(currentIndex, 1);
            closedset.push(current);

            // Runs through the neighbors
            var neighbors = this.neighbors(current, goal, map);
            if (debug) {
                console.log('\n\t---------------Neighbors-------------------');
            }
            for (i = 0; i < neighbors.length; i++) {
                // Has neighbor already been visited?
                if (this.isNodeInList(neighbors[i].node, closedset)) {
                    if (debug) {
                        console.log('\t\t' + this.nodeString(neighbors[i], goal) + '\t Neighbor is already visited.');
                    }
                    continue;
                }

                var tentativeBool = false;
                var tentative_g_score = current.g + this.distanceBetween(current.node, neighbors[i].node);
                // Check if neighbor is in the openset or if it has lower g score.
                if (!this.isNodeInList(neighbors[i].node, openset)) {
                    openset.push(neighbors[i]);

                    neighbors[i].f = neighbors[i].g + this.heuristic(neighbors[i].node, goal);
                    tentativeBool = true;
                } else if (tentative_g_score < neighbors[i].g) { // If neighbor is not in openset
                    tentativeBool = true;
                }

                // Adds to current path
                if (tentativeBool) {
                    neighbors[i].from = current;
                    neighbors[i].g = tentative_g_score;
                    if (debug) {
                        console.log('\t\t' + this.nodeString(neighbors[i], goal) + '\t added to current path');
                    }
                }
            }
            if (debug) {
                console.log('\n-----------------End Current------------------\n');
            }
        } // End while

        // If a route has been found.
        if (ret) {
            console.log("\nPath found in " + (count + 1) + ((count + 1 == 1) ? ' step' : ' steps'));
            if (debug) {
                console.log('Current path:');
                console.log('\n');
                for (var i = 0; i < current_path.length; i++) {
                    console.log('\t' + this.nodeString(current_path[i], goal));
                }
            }
            draw.drawRoute(current_path, map);
            return current_path;
            // If a route has not been found.
        } else {
            alert("Program terminated. Could not find a path");
            console.log("Program terminated. Could not find a path");
        }


    },
    /**
     * Returns a string of a node with its coordinates (x,y) and f, g and h values.
     * @param  {node-object} node [description]
     * @param  {(x,y)-coordinates} goal [description]
     * @return {string}      [description]
     */
    nodeString: function(node, goal) {
        if (goal)
            return '(' + node.node.x + ', ' + node.node.y + ') \t f: ' + node.f.toFixed(2) + ' \t g: ' + node.g.toFixed(2) + ' \t h: ' + this.heuristic(node.node, goal).toFixed(2);
        else
            return '(' + node.node.x + ', ' + node.node.y + ') \t f: ' + node.f.toFixed(2) + ' \t g: ' + node.g.toFixed(2);
    },
    nodeCNF: function(node) {
        if (node.value[0].length == 0 && node.value[1].length == 0)
            return '[]';

        var value = node.value[0].join(', ');
        if (node.value[1].length > 0) {
            if (node.value[0].length == 0)
                value += '!';
            else
                value += ', !';
            value += node.value[1].join(', !');
        }

        return value + ' \t f: ' + node.f + ' \t g: ' + node.g + ' \t h: ' + this.heuristicCNF(node.value);
    },
    nodeCNF_nodetails: function(node) {
        if (node[0].length == 0 && node[1].length == 0)
            return '[]';
        var value = node[0].join(', ');
        if (node[1].length > 0) {
            if (node[0].length == 0)
                value += '!';
            else
                value += ', !';
            value += node[1].join(', !');
        }
        
        return value;
    },
    /**
     * Returns the output path
     * @param  {node-object} node [description]
     * @return {list of node-objects}      [description]
     */
    pathTo: function(node) {
        var cur_from = node;
        var ret_path = [];
        do {
            console.log(cur_from);
            var cur_node = {
                "name": cur_from.name,
                "node": cur_from.node,
                "g": cur_from.g,
                "f": cur_from.f
            };
            cur_from = cur_from.from;
            ret_path.push(cur_node);
        } while (cur_from !== null && cur_from.node !== null);
        return ret_path.reverse();
    },
    resolutionPath: function(node) {
        var cur_from = node;
        var ret_path = [];
        do {
            console.log(cur_from);
            var cur_node = {
                "value": cur_from.value,
                "g": cur_from.g,
                "f": cur_from.f,
                "org_value": cur_from.org_value
            };
            cur_from = cur_from.from;
            ret_path.push(cur_node);
        } while (cur_from !== null && cur_from.node !== null);
        return ret_path.reverse();
    },
    neighbors: function(node, goal, map) {
        var ret_neighbors = [];
        if (map.length < 1) {
            return ret_neighbors;
        }
        for (var i = 0; i < map.length; i++) {
            if (map[i].start.x == node.node.x && map[i].start.y == node.node.y) { // If start equals the node, the map.end node must be a neighbor.
                ret_neighbors.push({
                    "name": map[i].name,
                    "node": map[i].end,
                    "g": (typeof node.g == 'undefined' ? 0 : node.g),
                    "f": node.g + this.heuristic(node.node, goal)
                });
            }
        }
        return ret_neighbors;
    },
    neighborsCNF: function(node, map) {
        var ret_neighbors = [];
        if (map.length < 1) {
            return ret_neighbors;
        }
        for (var i = 0; i < map.length; i++) {
            var elimination = this.CNFelmination(node.value, map[i].value);
            ret_neighbors.push({
                "value": elimination,
                "g": node.g + Math.abs(node.g - this.lengthOf(map[i].value)), // Using heuristic function to find length of node
                "f": node.g + Math.abs(node.g - this.lengthOf(map[i].value)) + this.heuristicCNF(elimination),
                "org_value": map[i].value,
                "closed": map[i].closed,
                "id": i
            });
        }
        return ret_neighbors;
    },
    heuristic: function(start, goal) {
        var d1 = Math.abs(start.x - goal.x);
        var d2 = Math.abs(start.y - goal.y);

        return Math.sqrt(Math.pow(d1, 2) + Math.pow(d2, 2));
    },
    /**
     * Calculates the distance between start and goal
     * @param  {(x,y)-coordinates} start [description]
     * @param  {(x,y)-coordinates} goal  [description]
     * @return {int}       [description]
     */
    distanceBetween: function(start, goal) {
        var x = start.x - goal.x;
        var y = start.y - goal.y;

        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

    },
    /**
     * Checks if node is in a list
     * @param  {node-object}  node [description]
     * @param  {list of node-objects}  list [description]
     * @return {Boolean}      [description]
     */
    isNodeInList: function(node, list, cnf) {
        if (cnf) {
            for (var i = 0; i < list.length; i++) {
                if (node.value[0] == list[i].value[0] && node.value[1] == list[i].value[1]) {
                    return true;
                }
            }
            return false;
        }
        for (var i = 0; i < list.length; i++) {
            if (list[i].node.x == node.x && list[i].node.y == node.y) {
                return true;
            }
        }
        return false;
    },
    isNodeEquals: function(node1, node2) {
        return parseInt(node1.x) == parseInt(node2.x) && parseInt(node1.y) == parseInt(node2.y);
    },
    rbfs_function: function(goal, node, map, limit, debug) {
        // Is current node in goal state.
        if (debug) {
            console.log('---------------Current-------------------');
            console.log(this.nodeString(node, goal));
        }
        if (this.isNodeEquals(node.node, goal)) {
            return node;
        }
        var successors = [];
        var neighbors = this.neighbors(node, goal, map);
        if (debug) {
            console.log('\n\t---------------Neighbors-------------------');
        }
        for (var i = 0; i < neighbors.length; i++) {
            neighbors[i].f = Math.max(neighbors[i].f, node.f);
            successors.push(neighbors[i]);
            if (debug) {
                console.log('\t' + this.nodeString(neighbors[i], goal));
            }
        }
        // If node has no neighbors
        if (successors.length < 1) {
            return false;
        }

        // Sorting f values - smallest first
        best = successors.sort(function(a, b) {
            return a.f - b.f
        });

        if (debug) {
            console.log('\tBest: ' + this.nodeString(best[0], goal) + '\tvs limit: ' + limit);
            console.log('---------------End Current-------------------\n');
        }
        if (best[0].f > limit) {
            return false;
        }
        best[0].from = node;
        var result = this.rbfs_function(goal, best[0], map, Math.min(limit, (best.length > 1 ? best[1].f : best[0].f)), debug);

        if (result) {
            return result;
        } else {

        }
    },
    rbfs: function(start, goal, map, debug) {
        var node = {
            "name": start.name,
            "node": start.start,
            "g": 0,
            "f": this.heuristic(start.start, goal),
            "from": null
        };
        var path = this.rbfs_function(goal, node, map, Infinity, debug);
        if (debug) {
            console.log(path);
        }
        if (path) {
            if (debug) {
                console.log('Node found');
                console.log(node);
                console.log('---------------End Current-------------------\n');
            }
            return this.pathTo(path);
        }
   },
   initCNF: function(map) {
        var ret_map = [];
        for (var i = 0; i < map.length; i++) {
            ret_map.push({
                "value": map[i],
                "closed": false,
                "from": null,
                "g": 0,
                "f": 0
            });
        }
        return ret_map;
   },
   astarCNF : function(map, debug) {
        if (debug) {
            console.log('------------------------Making Resolution---------------------------');
        }

        if (map.length < 1) {
            console.log('error');
            return;
        }

        map = this.initCNF(map);

        var openset = [];
        map[0].org_value = [[], ["a"]];
        var node = {
            "value": this.CNFelmination(map[0].value, [[], ["a"]]),
            "g": 0,
            "f": 0,
            "from": map[0],
            "closed": false,
            "org_value": map[0].value,
            "id": 0
        };
        openset.push(node);

        var ret = false;
        var count = 0;
        var current;
        var currentIndex;
        var resolution_path = [];
        while (openset.length > 0) {
            currentIndex = 0;
            current = openset[currentIndex];
            for (var i = 1; i < openset.length; i++) { // Finding lowest f value in openset.
                if (openset[i].f < current.f) {
                    currentIndex = i; 
                }
            }

            current = openset[currentIndex];
            // Checking if we are at the goal
            if (current.value[0].length == 0 && current.value[1].length == 0) {
                resolution_path = this.resolutionPath(current);
                ret = true;
                break;
            }

            if (debug) {
                console.log('\n::::::::::::::::' + count + ':::::::::::::::');
                console.log('--------------Current node-----------------');
                console.log(current);
                console.log('\t' + this.nodeCNF(current));
            }

            // Remove current from openset and push to closedset (visited nodes).
            openset.splice(currentIndex, 1);
            current.closed = true;
            map[current.id].closed = true;

            // Runs through the neighbors
            var neighbors = this.neighborsCNF(current, map);
            if (debug) {
                console.log('\n\t---------------Neighbors-------------------');
            }
            for (i = 0; i < neighbors.length; i++) {
                // Has neighbor already been visited?
                if (neighbors[i].closed) {
                    if (debug) {
                        console.log('\t\t\t' + this.nodeCNF(neighbors[i]) + '\t Neighbor is already visited.');
                    }
                    continue;
                }

                var tentativeBool = false;
                // Check if neighbor is in the openset or if it has lower g score.
                if (!this.isNodeInList(neighbors[i], openset, true)) {
                    openset.push(neighbors[i]);
                    tentativeBool = true;
                }

                // Adds to current path
                if (tentativeBool) {
                    neighbors[i].from = current;
                    if (debug) {
                        console.log('\t\t' + this.nodeCNF_nodetails(current.value) + ' AND ' + this.nodeCNF_nodetails(neighbors[i].org_value) + ' resolves to: \t ' + this.nodeCNF(neighbors[i]));
                    }
                }
            }
            if (debug) {
                console.log('\n\t-----------------Openset-------------------');
                for (var i = 0; i < openset.length; i++) {
                    console.log('\t\t' + this.nodeCNF_nodetails(openset[i].value));
                }
                console.log('\n-----------------End Current------------------\n');

            }
        } // End while

        // If a route has been found.
        if (ret) {
            console.log("\nResolution path found in " + (count) + ((count == 1) ? ' step' : ' steps'));
            if (debug) {
                console.log('Current path:');
                console.log(resolution_path);
                console.log('\n');
                console.log('\t' + this.nodeCNF_nodetails(resolution_path[0].org_value) + ' AND ' + this.nodeCNF_nodetails(resolution_path[1].org_value) + ' -> ' + this.nodeCNF(resolution_path[1]));
                for (var i = 2; i < resolution_path.length; i++) {
                    console.log('\t' + this.nodeCNF_nodetails(resolution_path[i-1].value) + ' AND ' + this.nodeCNF_nodetails(resolution_path[i].org_value) + ' -> ' + this.nodeCNF(resolution_path[i]));
                }
            }
            return resolution_path;
            // If a route has not been found.
        } else {
            alert("Program terminated. Could not find a path");
            console.log("Program terminated. Could not find a path");
        }
    },
    lengthOf: function(node) {
        return node[0].length + node[1].length; // Takes length of positive + negative.
    },
    heuristicCNF: function(node) {
        // console.log("heuristic");
        return this.lengthOf(node); // Takes length of positive + negative.
    },
    CNFelmination: function(node, node2) {
        var pos_node = node[0].concat(node2[0]).unique();
        var neg_node = node[1].concat(node2[1]).unique();
        for (var i = 0; i < pos_node.length; i++) {
            for (var j = 0; j < neg_node.length; j++) {
                if (pos_node[i] == neg_node[j]) {
                    pos_node.splice(i, 1);
                    neg_node.splice(j, 1);
                    break;
                }
            }
        }
        return [pos_node, neg_node];
    }
};