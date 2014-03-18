$(function() {
    $('#submit').click(function() {
        parseMapToJson($('#map').val());
    });
});

function parseMapToJson(text) {
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
    }
}