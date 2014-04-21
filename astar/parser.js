/**
 * Parse a map into a list
 * @param  string text
 *
 *
Map
[
    {
        "start": {
            "x": 10,
            "y": 20
        },
        "name": "Vesterbrogade",
        "goal": {
            "x": 30,
            "y": 40
        }
    },
    {
        "start": {
            "x": 20,
            "y": 20
        },
        "name": "Vesterbrogade",
        "goal": {
            "x": 30,
            "y:" 30
        }
    }
]
 */

/**
 * Parser
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
    },
    parseCNF: function(text) {
        var split = text.split('\n');
        var ret_json = [];
        //var patt = new RegExp("(([!]?\w)+\s*)+", "i");
        for (var i = 0; i < split.length; i++) {
            /*console.log(patt.test(split[i]));
            if (!patt.test(split[i])) {
                console.log('No match');
                continue;
            }*/
            // Splits on every if
            // ex. a if b => a or !b
            split[i] = split[i].trim();
            if (split[i].indexOf('if') != -1) {
                var s = split[i].split('if');
                var sr = s[1].trim().split(' ');
                ret_json.push(s[0] + ' | !(' + sr.join(' | ') + ')');
            } else {
                var s = split[i].trim();
                var sr = split[i].trim().split(' ');
                ret_json.push(sr.join(' | '));
            }
            // insert = insert.replace(/(\w)(\s)(\w)/g, '$1 | $3'); // Need to be improved p d c a & d d & d & !p !f is replaced with p | d c | a & d | d & d & !p !f
            
        }
        return ret_json;
    }
};