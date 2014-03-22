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