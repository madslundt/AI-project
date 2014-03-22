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
                    "start": {
                        "x": parseInt(svalue[0]),
                        "y": parseInt(svalue[1])
                    },
                    "name": svalue[2],
                    "end": {
                        "x": parseInt(svalue[3]),
                        "y": parseInt(svalue[4])
                    }
                }
                // Add coordinates to the street.
                ret_json.push(street);
            }
        }
        if (ret_json.length < 1) {
            return false;
        }
        this.setSelector(ret_json);
        console.log(ret_json);
        return ret_json;
    },
    setSelector: function(map) {
        $('.start_select').html('');
        $('.goal_select').html('');
        for (var i = 0; i < map.length; i++) {
            $('.start_select').append('<option value="' + i + '">(' + map[i].start.x + ', ' + map[i].start.y + ')</option>');
            $('.goal_select').append('<option value="' + i + '">(' + map[i].end.x + ', ' + map[i].end.y + ')</option>');
        }
        if (map.length < 1) {
            $('.start_select').html('<option>No nodes</option>');
            $('.goal_select').html('<option>No nodes</option>');
        }
    }
};