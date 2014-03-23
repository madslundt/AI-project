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
            if (openset[currentIndex].node.x == goal.x && openset[currentIndex].node.y == goal.y) {
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
                        console.log('\t\t' + this.nodeString(neighbors[i], goal) +'\t Neighbor is already visited.');
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

            // If the loop stucks and can't find a route, it breaks out. Should not be triggered!
            if (count++ >= 100) {
                console.log('Count reached.');
                break;
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
    /**
     * Returns the output path
     * @param  {node-object} node [description]
     * @return {list of node-objects}      [description]
     */
    pathTo: function(node) {
        var cur_from = node;
        var ret_path = [];
        do {
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
    /**
     * Manhatten
     */
    heuristic: function(start, goal) {
        var d1 = Math.abs(start.x - goal.x);
        var d2 = Math.abs(start.y - goal.y);

        return d1 + d2;
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
    isNodeInList: function(node, list) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].node.x == node.x && list[i].node.y == node.y) {
                return true;
            }
        }
        return false;
    },
    rbfs_function: function(goal, node, map, limit) {
        // Is current node in goal state.
        if (goal.x == node.x && goal.y == node.y) {
            return {"status": true, "result": node};
        }
        var successors = [];
        var neighbors = this.neighbors(node, goal, map);
        for (var i = 0; i < neighbors.length; i++) {
            neighbors[i].f = Math.max(neighbors[i].f, node.f);
            successors.push(neighbors[i]);
        }
        // If node has no neighbors
        if (successors.length < 1) {
            return {"status": false};
        }
        
        var best = [];
        for (i = 0; i < successors.length; i++) {
            best.push(successors[i]);
        }
        // Sorting f values - smallest first
        best = best.sort(function(a,b){return a.f-b.f});
        if (best[0].f > limit) {
            return {"status": false};
        }
        var ret = this.rbfs_function(goal, best[0], map, Math.min(limit, best[1].f));
        if (ret.status) {
            return {"status": true, "result": ret.result};
        }
        
      },
      rbfs: function(start, goal, map) {
        var node = {
          "name": start.name,
          "node": start.start,
          "g": 0,
          "f": this.heuristic(start.start, goal),
          "from": null
        };
        return this.rbfs_function(goal, node, map, Infinity);
      }
};