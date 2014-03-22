var astar = {
    /**
     * [search description]
     * @param  Node-object start [description]
     * @param  [x, y] end   [description]
     * @param  [map] map   [description]
     */
    search: function(start, goal, map, debug) {
        if (debug) {
            console.clear();
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
            "f": this.heuristic(start, goal),
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


            console.log(current);
            if (debug) {
                console.log('\n::::::::::::::::' + count + ':::::::::::::::');
                console.log('--------------Current node-----------------');
                console.log("(" + current.node.x + ", " + current.node.y + ") \t f: " + current.f + " \t g: " + current.g + ' \t h: ' + this.heuristic(current.node, goal));
            }

            // Remove current from openset.
            openset.splice(currentIndex, 1);
            closedset.push(current);
            var neighbors = this.neighbors(current, map);
            if (debug) {
                console.log('---------------Neighbors-------------------');
                console.log(neighbors);
            }
            for (i = 0; i < neighbors.length; i++) {
                if (this.isNodeInList(neighbors[i].node, closedset)) {
                    if (debug) {
                        console.log('\n(' + neighbors[i].node.x + ', ' + neighbors[i].node.y + ') \t Neighbor is already visited\n');
                    }
                    continue;
                }

                var tentativeBool = false;
                if (!this.isNodeInList(neighbors[i].node, openset)) {
                    openset.push(neighbors[i]);
                    var tentative_g_score = current.g + this.distanceBetween(current, neighbors[i]);
                    neighbors[i].f = neighbors[i].g + this.heuristic(neighbors[i].node, goal);
                    tentativeBool = true;
                } else if (tentative_g_score < neighbors[i].g) { // If neighbor is not in openset
                    tentativeBool = true;
                }

                if (tentativeBool) {
                    neighbors[i].from = current;
                    neighbors[i].g = tentative_g_score;
                    if (debug) {
                        console.log('(' + neighbors[i].node.x + ', ' + neighbors[i].node.y + ') \t f: ' + neighbors[i].f + ' \t g: ' + neighbors[i].g + ' \t h: ' + this.heuristic(neighbors[i].node, goal));
                        console.log('added to currentpath.\n');
                    }
                }
            }
            if (debug) {
                console.log('-----------------End while------------------\n');
            }
            if (count++ >= 100) {
                console.log('Count reached.');
                break;
            }
        } // End while

        if (ret) {
            console.log("\nPath found");
            if (debug) {
                console.log('Current path:');
                console.log(current_path);
            }
            draw.drawRoute(current_path, map);
            return current_path;
        } else {
            alert("Program terminated. Could not find a path");
            console.log("Program terminated. Could not find a path");
        }


    },
    pathTo: function(node) {
        console.log(node);
        var curr = node;
        var path = [];
        while (curr) {
            path.push(curr);
            curr = curr.from;
        }
        path = path[0];
        var cur_from = path;
        var ret_path = [];
        do {

            var cur_node = {
                "name": cur_from.name,
                "node": cur_from.node
            };
            cur_from = cur_from.from;
            ret_path.push(cur_node);
        } while (cur_from !== null && cur_from.node !== null);
        return ret_path.reverse();
    },
    neighbors: function(node, map) {
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
                    "f": (typeof node.f == 'undefined' ? 0 : node.f)
                });
            }
        }
        console.log(ret_neighbors.length);
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
    distanceBetween: function(start, goal) {
        var x = start.node.x - goal.node.x;
        var y = start.node.y - goal.node.y;

        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

    },
    isNodeInList: function(node, list) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].node.x == node.x && list[i].node.y == node.y) {
                return true;
            }
        }
        return false;
    }
};