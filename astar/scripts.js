var map = [];

$(function() {
    var canvas = document.getElementById('mapCanvas');
    $('#submit').click(function() {
        parseMap($('#map').val());
    });
    $('#draw').click(function() {
        draw.drawMap(canvas, map);
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
        "end": [
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
        "end": [
            30,
            30
        ]
    }
]
 */


function parseMap(text) {
    var split = text.split('\n');
    var ret_json = [];
    $.each(split, function(key, value) {
        var svalue = value.split(' ');

        // Check for robustness.
        // Coordinates have to be integers.
        if (svalue.length == 5 &&
            svalue[0] == parseInt(svalue[0]) && svalue[1] == parseInt(svalue[1]) &&
            svalue[3] == parseInt(svalue[3]) && svalue[4] == parseInt(svalue[4])) {
            var street = {
                "start": [svalue[0], svalue[1]],
                "name": svalue[2],
                "end": [svalue[3], svalue[4]]
            }
            // Add coordinates to the street.
            ret_json.push(street);
        }
    });
    this.map = ret_json;
}

var astar = {
    init: function(map) {
        for (var i = 0; i < map.length; i++) {
            map[i].g = 0;
            map[i].f = 0;
            map[i].h = 0;
        }
    },
    /**
     * [search description]
     * @param  [x, y] start [description]
     * @param  [x, y] end   [description]
     * @param  [map] map   [description]
     */
    search: function(start, end, map) {
        astar.init(map);

        var closedset = [];
        var openset = [];
        var came_from = [];
    },
    neighbors: function(node, map) {
        var ret_neighbors = [];
        for (var i = 0; i < map.length; i++) {
            if (map[i].start == node) {
                ret_neighbors.push(map[i]);
            }
        }
        return ret_neighbors;
    }
};

var draw = {
    drawArrow: function(ctx, fromPoint, toPoint) {
        var dx = toPoint.x - fromPoint.x;
        var dy = toPoint.y - fromPoint.y;

        // normalize
        var length = Math.sqrt(dx * dx + dy * dy);
        var unitDx = dx / length;
        var unitDy = dy / length;
        // increase this to get a larger arrow head
        var arrowHeadSize = 7;


        // Drawing Arrow Line.
        ctx.beginPath();
        ctx.moveTo(fromPoint.x, fromPoint.y);
        ctx.lineTo(toPoint.x, toPoint.y);
        ctx.closePath();
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.moveTo(toPoint.x, toPoint.y);
        ctx.lineTo((toPoint.x - unitDx * arrowHeadSize - unitDy * arrowHeadSize), (toPoint.y - unitDy * arrowHeadSize + unitDx * arrowHeadSize));
        ctx.lineTo((toPoint.x - unitDx * arrowHeadSize + unitDy * arrowHeadSize), (toPoint.y - unitDy * arrowHeadSize - unitDx * arrowHeadSize));
        ctx.lineTo(toPoint.x, toPoint.y);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.stroke();

        /*ctx.moveTo((toPoint.x - unitDx * arrowHeadSize - unitDy * arrowHeadSize), (toPoint.y - unitDy * arrowHeadSize + unitDx * arrowHeadSize));
        ctx.lineTo(toPoint.x, toPoint.y);
        ctx.lineTo((toPoint.x - unitDx * arrowHeadSize + unitDy * arrowHeadSize), (toPoint.y - unitDy * arrowHeadSize - unitDx * arrowHeadSize));
        ctx.stroke();*/
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
        for (var i = 0; i < map.length; i++) {

            var x1 = ((map[i].start[0] > 0) ? (map[i].start[0] - x_min) : 1);
            var y1 = ((map[i].start[1] > 0) ? (map[i].start[1] - y_min) : 1);
            var x2 = ((map[i].end[0] > 0) ? (map[i].end[0] - x_min) : 1);
            var y2 = ((map[i].end[1] > 0) ? (map[i].end[1] - y_min) : 1);
            x1 += 5;
            x2 += 5;
            y1 += 5;
            y2 += 5;
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
            context.fillStyle = 'black';
            context.fill();

            // Drawing lines / edges
            context.beginPath();
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);
            context.stroke();

            // Arrow head
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
            context.textAlign = 'center';
            context.fillStyle = '#000';

            context.fillText(map[i].name, centerX, centerY);
        }
    }
};