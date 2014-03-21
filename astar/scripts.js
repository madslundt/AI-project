var map = [];

$(function() {
    var canvas = document.getElementById('mapCanvas');
    $('#submit').click(function() {
        map = parse.parseMap($('#map').val());
        if (map.length > 0)
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

    document.getElementById('upload').addEventListener('change', readSingleFile, false);

    function readSingleFile(evt) {
        //Retrieve the first (and only!) File from the FileList object
        var f = evt.target.files[0]; 

        if (f) {
            var r = new FileReader();
            r.onload = function(e) { 
                var contents = e.target.result;
                if (map = parse.parseMap(contents)) {
                    console.log(map);
                    draw.drawMap(canvas, map);
                } else {
                    console.log('Wrong file');
                    alert("Wrong file");
                }
            };
            r.readAsText(f);
        } else { 
            alert("Failed to load file");
        }
    }
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
                    "start": {"x": svalue[0], "y": svalue[1]},
                    "name": svalue[2],
                    "end": {"x": svalue[3], "y": svalue[4]}
                }
                // Add coordinates to the street.
                ret_json.push(street);
            }
        }
        if (ret_json.length < 1) {
            return false;
        }
        this.setSelector(ret_json);
        return ret_json;
    },
    setSelector: function(map) {
        $('.start_select').html('');
        $('.goal_select').html('');
        for (var i = 0; i < map.length; i++) {
            $('.start_select').append('<option value="' + i + '">(' + map[i].start.x + ', ' + map[i].start.y + ')</option>');
            $('.goal_select').append('<option value="' + i + '">(' + map[i].start.x + ', ' + map[i].start.y + ')</option>');
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
    pathTo: function(node){
        var curr = node;
        var path = [];
        while(curr) {
            path.push(curr);
            curr = curr.from;
        }
        path = path[0];
        var cur_from = path;
        var ret_path = [];
        while (cur_from !== null && cur_from.node !== null) {
            
            var cur_node = {"name": cur_from.name, "node": cur_from.node};
            cur_from = cur_from.from;
            ret_path.push(cur_node);
        }
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
                    "node": map[i].end,
                    "g": (typeof node.g == 'undefined' ? 0 : node.g),
                    "f": (typeof node.f == 'undefined' ? 0 : node.f),
                    "name": map[i].name
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
        var x_min = map[0].start.x;
        var y_min = map[0].start.y;

        for (var i = 0; i < map.length; i++) {
            x_max = Math.max(map[i].start.x, map[i].end.x, x_max);
            y_max = Math.max(map[i].start.y, map[i].end.y, y_max);
            x_min = Math.min(map[i].start.x, map[i].end.x, x_min);
            y_min = Math.min(map[i].start.y, map[i].end.y, y_min);
        }
        var incX = canvas.width / x_max;
        var incY = canvas.height / y_max;
        var add = 5;
        this.infobar(canvas, incX, incY, x_min, y_min, add, radius);
        for (var i = 0; i < map.length; i++) {

            var x1 = ((map[i].start.x > 0) ? (map[i].start.x - x_min) : 1);
            var y1 = ((map[i].start.y > 0) ? (map[i].start.y - y_min) : 1);
            var x2 = ((map[i].end.x > 0) ? (map[i].end.x - x_min) : 1);
            var y2 = ((map[i].end.y > 0) ? (map[i].end.y - y_min) : 1);

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
        var x_min = map[0].start.x;
        var y_min = map[0].start.y;

        for (var i = 0; i < map.length; i++) {
            x_max = Math.max(map[i].start.x, map[i].end.x, x_max);
            y_max = Math.max(map[i].start.y, map[i].end.y, y_max);
            x_min = Math.min(map[i].start.x, map[i].end.x, x_min);
            y_min = Math.min(map[i].start.y, map[i].end.y, y_min);
        }
        var incX = canvas.width / x_max;
        var incY = canvas.height / y_max;
        var add = 5;
        for (i = 0; i < path.length - 1; i++) {
            var x1 = ((path[i].node.x > 0) ? (path[i].node.x - x_min) : 1);
            var y1 = ((path[i].node.y > 0) ? (path[i].node.y - y_min) : 1);
            var x2 = ((path[i + 1].node.x > 0) ? (path[i + 1].node.x - x_min) : 1);
            var y2 = ((path[i + 1].node.y > 0) ? (path[i + 1].node.y - y_min) : 1);

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
            } 
            if (i == (path.length - 2)) {
                console.log('draw');
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