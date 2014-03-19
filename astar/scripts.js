var map = [];

$(function() {
    var canvas = document.getElementById('mapCanvas');
    $('#submit').click(function() {
        map = parse.parseMap($('#map').val());
        draw.drawMap(canvas, map);
    });

    $('#findPath').click(function() {
        var start = document.getElementById('start_select');
        var startval = start.options[start.selectedIndex].value;
        console.log('From: ' + map[startval].start);

        var goal = document.getElementById('goal_select');
        var goalval = goal.options[goal.selectedIndex].value;
        console.log('To: ' + map[goalval].start);
        astar.search(map[startval].start, map[goalval].start, map, true);
    });

    canvas.width = document.getElementById('container').clientWidth;
    canvas.height = document.getElementById('container').clientHeight;
});
/**
 * Parse a map into a list
 * @param  string text
 *
 * 
[
    {
        "start": [
            10,
            20
        ],
        "name": "Vesterbrogade",
        "goal": [
            30,
            40
        ]
    },
    {
        "start": [
            20,
            20
        ],
        "name": "Vesterbrogade",
        "goal": [
            30,
            30
        ]
    }
]
 */


var parse = {
    parseMap: function(text) {
        var split = text.split('\n');
        var ret_json = [];
        for (var i = 0; i < split.length; i++) {
            var svalue = split[i].split(' ');

            // Check for robustness.
            // Coordinates have to be integers.
            if (svalue.length == 5 &&
                svalue[0] == parseInt(svalue[0]) && svalue[1] == parseInt(svalue[1]) &&
                svalue[3] == parseInt(svalue[3]) && svalue[4] == parseInt(svalue[4])) {
                var street = {
                    "id": i,
                    "start": [svalue[0], svalue[1]],
                    "name": svalue[2],
                    "end": [svalue[3], svalue[4]]
                }
                // Add coordinates to the street.
                ret_json.push(street);
            }
        }
        this.setSelector(ret_json);
        return ret_json;
    },
    setSelector: function(map) {
        $('.start_select').html('');
        $('.goal_select').html('');
        for (var i = 0; i < map.length; i++) {
            $('.start_select').append('<option value="' + i + '">(' + map[i].start[0] + ', ' + map[i].start[1] + ')</option>');
            $('.goal_select').append('<option value="' + i + '">(' + map[i].start[0] + ', ' + map[i].start[1] + ')</option>');
        }
        if (map.length < 1) {
            $('.start_select').html('<option>No nodes</option>');
            $('.goal_select').html('<option>No nodes</option>');
        }
    }
};

var astar = {
    init: function(start, map) {
        var ret_index = -1;
        for (var i = 0; i < map.length; i++) {
            if (map[i].start == start) {
                ret_index = i;
            }
        }

        return ret_index;
    },
    /**
     * [search description]
     * @param  [x, y] start [description]
     * @param  [x, y] end   [description]
     * @param  [map] map   [description]
     */
    search: function(start, goal, map, debug) {
        console.clear();
        console.log('------------------------Find path---------------------------');
        var start_index = astar.init(start, map);
        if (start_index == -1) {
            console.log('error');
            return;
        }

        var closedset = [];
        var openset = [];
        var node = {
            "node": start,
            "g": 0,
            "f": this.heuristic(start, goal)
        }
        openset.push(node);

        var current_path = [];
        var ret = false;
        var count = 0;
        var current;
        var currentIndex = 0;
        while (openset.length > 0) {
            current = openset[0];
            for (var i = 0; i < openset.length; i++) { // Finding lowest f value in openset.
                if (openset[i].f < current.f) {

                    current = openset[i];
                    currentIndex = i;
                }
            }
            if (debug) {
                console.log('\n::::::::::::::::' + count + ':::::::::::::::');
                console.log('--------------Current node-----------------');
                console.log("(" + current.node[0] + ", " + current.node[1] + ") \t g: " + current.g + " \t f: " + current.f + ' \t h: ' + this.heuristic(current.node, goal));
            }
            // Checking if we are at the goal
            if (current.node[0] == goal[0] && current.node[1] == goal[1]) {
                // Maybe draw to the map
                current_path.push(current);
                ret = true;
                break;
            }

            // Remove current from openset.
            openset.splice(openset[currentIndex], 1);
            closedset.push(current);
            var neighbors = this.neighbors(current, map);
            if (debug) {
                console.log('---------------Neighbors-------------------');
                console.log(neighbors);
            }
            for (i = 0; i < neighbors.length; i++) {
                if (this.isNodeInList(neighbors[i].node, closedset)) {
                    if (debug) {
                        console.log('Neighbor is already visited (' + neighbors[i].node[0] + ', ' + neighbors[i].node[1] + ')');
                    }
                    continue;
                }
                var tentative_g_score = current.g + this.distanceBetween(current, neighbors[i]);

                if (!this.isNodeInList(neighbors[i].node, openset) || tentative_g_score < neighbors[i].g) { // If neighbor is not in openset
                    current_path.push(current);
                    neighbors[i].g = tentative_g_score;
                    neighbors[i].f = neighbors[i].g + this.heuristic(neighbors[i].node, goal);

                    if (!this.isNodeInList(neighbors[i].node, openset)) {
                        openset.push(neighbors[i]);
                        if (debug) {
                            console.log('(' + neighbors[i].node[0] + ', ' + neighbors[i].node[1] + ') \t f: ' + neighbors[i].f + ' \t g: ' + neighbors[i].g + ' \t h: ' + this.heuristic(neighbors[i].node, goal) + '\t\t pushed to openset');
                        }
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
            console.log("Path found");
            if (debug) {
                console.log(current_path);
            }
            draw.drawRoute(current_path, map);
        } else {
            alert("Program terminated. Could not find a path");
            console.log("Program terminated. Could not find a path");
        }


    },
    neighbors: function(node, map) {
        var ret_neighbors = [];
        if (map.length < 1) {
            return ret_neighbors;
        }
        for (var i = 0; i < map.length; i++) {
            if (map[i].start[0] == node.node[0] && map[i].start[1] == node.node[1]) { // If start equals the node, the map.end node must be a neighbor.
                ret_neighbors.push({
                    "node": map[i].end,
                    "g": (typeof node.g == 'undefined' ? 0 : node.g),
                    "f": (typeof node.f == 'undefined' ? 0 : node.f)
                });
            }
        }
        return ret_neighbors;
    },
    /**
     * Manhatten
     */
    heuristic: function(start, goal) {
        var d1 = Math.abs(start[0] - goal[0]);
        var d2 = Math.abs(start[1] - goal[1]);

        return d1 + d2;
    },
    distanceBetween: function(start, goal) {
        var x = start.node[0] - goal.node[0];
        var y = start.node[1] - goal.node[1];

        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

    },
    isNodeInList: function(node, list) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].node[0] == node[0] && list[i].node[1] == node[1]) {
                return true;
            }
        }
        return false;
    }
};

var draw = {
    infobar: function(canvas, incX, incY, x_min, y_min, add, radius) {
        canvas.addEventListener('mousemove', function(evt) {
            var mousePos = draw.getMousePos(canvas, evt);
            var message = 'X: ' + parseInt((mousePos.x / incX) + x_min - add - (radius / incX * 2)) + ', Y: ' + parseInt((mousePos.y / incY) + y_min - add - (radius / incY * 2));
            $('.infobar .position').text(message);
        }, false);

        canvas.addEventListener('click', function(evt) {
            var mousePos = draw.getMousePos(canvas, evt);
            var message = 'X: ' + parseInt((mousePos.x / incX) + x_min - add - (radius / incX * 2)) + ', Y: ' + parseInt((mousePos.y / incY) + y_min - add - (radius / incY * 2));
            $('.infobar .clickposition').text(message);
        }, false);

        $('.infobar .info').text(((map.length + 1) + ' nodes'));
    },
    getMousePos: function(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    },
    drawArrow: function(context, fromPoint, toPoint) {
        var dx = toPoint.x - fromPoint.x;
        var dy = toPoint.y - fromPoint.y;

        // normalize
        var length = Math.sqrt(dx * dx + dy * dy);
        var unitDx = dx / length;
        var unitDy = dy / length;
        // increase this to get a larger arrow head
        var arrowHeadSize = 7;


        // Drawing Arrow Line.
        context.beginPath();
        context.moveTo(fromPoint.x, fromPoint.y);
        context.lineTo(toPoint.x, toPoint.y);
        context.fillStyle = '#000';
        context.strokeStyle = '#000';
        context.closePath();
        context.lineWidth = 1;
        context.stroke();

        context.moveTo(toPoint.x, toPoint.y);
        context.lineTo((toPoint.x - unitDx * arrowHeadSize - unitDy * arrowHeadSize), (toPoint.y - unitDy * arrowHeadSize + unitDx * arrowHeadSize));
        context.lineTo((toPoint.x - unitDx * arrowHeadSize + unitDy * arrowHeadSize), (toPoint.y - unitDy * arrowHeadSize - unitDx * arrowHeadSize));
        context.lineTo(toPoint.x, toPoint.y);
        context.fillStyle = '#000';
        context.strokeStyle = '#000';
        context.fill();
        context.stroke();


        /*context.moveTo((toPoint.x - unitDx * arrowHeadSize - unitDy * arrowHeadSize), (toPoint.y - unitDy * arrowHeadSize + unitDx * arrowHeadSize));
        context.lineTo(toPoint.x, toPoint.y);
        context.lineTo((toPoint.x - unitDx * arrowHeadSize + unitDy * arrowHeadSize), (toPoint.y - unitDy * arrowHeadSize - unitDx * arrowHeadSize));
        context.stroke();*/
        context.closePath();
    },
    drawMap: function(canvas, map) {
        var context = canvas.getContext('2d');

        var radius = 5;
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Get max
        var x_max = 0;
        var y_max = 0;
        var x_min = map[0].start[0];
        var y_min = map[0].start[1];

        for (var i = 0; i < map.length; i++) {
            x_max = Math.max(map[i].start[0], map[i].end[0], x_max);
            y_max = Math.max(map[i].start[1], map[i].end[1], y_max);
            x_min = Math.min(map[i].start[0], map[i].end[0], x_min);
            y_min = Math.min(map[i].start[1], map[i].end[1], y_min);
        }
        var incX = canvas.width / x_max;
        var incY = canvas.height / y_max;
        var add = 5;
        this.infobar(canvas, incX, incY, x_min, y_min, add, radius);
        for (var i = 0; i < map.length; i++) {

            var x1 = ((map[i].start[0] > 0) ? (map[i].start[0] - x_min) : 1);
            var y1 = ((map[i].start[1] > 0) ? (map[i].start[1] - y_min) : 1);
            var x2 = ((map[i].end[0] > 0) ? (map[i].end[0] - x_min) : 1);
            var y2 = ((map[i].end[1] > 0) ? (map[i].end[1] - y_min) : 1);

            x1 += add;
            x2 += add;
            y1 += add;
            y2 += add;
            x1 *= incX;
            x2 *= incX;
            y1 *= incY;
            y2 *= incY;

            var centerX = ((parseInt(x1) + parseInt(x2)) / 2);
            var centerY = (parseInt(y1) + parseInt(y2)) / 2;

            // Drawing Nodes / vertices
            context.beginPath();
            context.arc(x1, y1, radius, 0, 2 * Math.PI, false);
            context.arc(x2, y2, radius, 0, 2 * Math.PI, false);
            context.fillStyle = '#000';
            context.fill();
            context.closePath();

            // Drawing lines / edges with arrow head
            var ax = x2 - (radius - 1);
            var ay = y2 - (radius - 1);
            if (x1 > x2) {
                ax = x2 + (radius - 1);
            }
            if (y1 > y2) {
                ay = y2 + (radius - 1);
            }
            this.drawArrow(context, {
                "x": x1,
                "y": y1
            }, {
                "x": ax,
                "y": ay
            });

            // Setting text / street name
            context.beginPath();
            context.textAlign = 'center';
            context.fillStyle = '#000';
            context.font = '10pt Arial';
            context.fillText(map[i].name, centerX, centerY);
            context.closePath();
        }
    },
    drawRoute: function(path, map) {
        var canvas = document.getElementById('mapCanvas');
        this.drawMap(canvas, map);
        var context = canvas.getContext('2d');
        var radius = 5;
        // Get max
        var x_max = 0;
        var y_max = 0;
        var x_min = map[0].start[0];
        var y_min = map[0].start[1];

        for (var i = 0; i < map.length; i++) {
            x_max = Math.max(map[i].start[0], map[i].end[0], x_max);
            y_max = Math.max(map[i].start[1], map[i].end[1], y_max);
            x_min = Math.min(map[i].start[0], map[i].end[0], x_min);
            y_min = Math.min(map[i].start[1], map[i].end[1], y_min);
        }
        var incX = canvas.width / x_max;
        var incY = canvas.height / y_max;
        var add = 5;
        for (i = 0; i < path.length - 1; i++) {
            var x1 = ((path[i].node[0] > 0) ? (path[i].node[0] - x_min) : 1);
            var y1 = ((path[i].node[1] > 0) ? (path[i].node[1] - y_min) : 1);
            var x2 = ((path[i + 1].node[0] > 0) ? (path[i + 1].node[0] - x_min) : 1);
            var y2 = ((path[i + 1].node[1] > 0) ? (path[i + 1].node[1] - y_min) : 1);

            x1 += add;
            y1 += add;
            x2 += add;
            y2 += add;

            x1 *= incX;
            y1 *= incY;
            x2 *= incX;
            y2 *= incY;


            // Drawing lines / edges with arrow head
            var ax = x2 - (radius - 1);
            var ay = y2 - (radius - 1);
            if (x1 > x2) {
                ax = x2 + (radius - 1);
            }
            if (y1 > y2) {
                ay = y2 + (radius - 1);
            }
            context.beginPath();
            context.moveTo(x1, y1);
            context.lineTo(ax, ay);
            context.lineWidth = 3;
            context.strokeStyle = '#b00';
            context.stroke();
            context.closePath();

            // Drawing start and end node.
            if (i == 0) {
                context.beginPath();
                context.arc(x1, y1, (radius * 2), 0, 2 * Math.PI, false);
                context.fillStyle = '#006600';
                context.lineWidth = 3;
                context.strokeStyle = '#000';
                context.fill();
                context.stroke();
                context.closePath();
            } else if (i == (path.length - 2)) {
                context.beginPath();
                context.arc(x2, y2, (radius * 2), 0, 2 * Math.PI, false);
                context.fillStyle = '#a00';
                context.lineWidth = 3;
                context.strokeStyle = '#000';
                context.fill();
                context.stroke();
                context.closePath();
            }
        }

    }
};