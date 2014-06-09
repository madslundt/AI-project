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
            split[i] = split[i].trim();
            if (split[i].length == 0)
                continue;
            var arr = [];
            var arrpos = [];
            var arrneg = [];
            //if there is a 'if', means there is a right and left side
            // Splits on every if
            // ex. a if b => a or !b
            // It only checks if ! is in the line. It doesn't work with multiple !.
            if (split[i].indexOf('if') != -1) {
                var s = split[i].split('if');
                var sl = s[0].trim().split(' ');
                for (var j = 0; j < sl.length; j++) {
                    if (sl[j].indexOf('!') != -1) {
                        arrneg.push(sl[j].substring(1));
                    } else {
                        arrpos.push(sl[j]);
                    }
                }
                var sr = s[1].trim().split(' ');
                //since the right hand side of 'if' should be negated the if statement have changed
                for (j = 0; j < sr.length; j++) {
                    if (sr[j].indexOf('!') != -1) {
                        arrpos.push(sr[j].substring(1));
                    } else {
                        arrneg.push(sr[j]);
                    }
                }
            } else {
                //if there only is a 'left' side
                var s = split[i].trim();
                var sr = split[i].trim().split(' ');
                for (var j = 0; j < sr.length; j++) {
                    if (sr[j].indexOf('!') != -1) {
                        arrneg.push(sr[j].substring(1));
                    } else {
                        arrpos.push(sr[j]);
                    }
                }
            }
            arr.push(arrpos);
            arr.push(arrneg);
            ret_json.push(arr);
            // insert = insert.replace(/(\w)(\s)(\w)/g, '$1 | $3'); // Need to be improved p d c a & d d & d & !p !f is replaced with p | d c | a & d | d & d & !p !f
            
        }

        return ret_json;
    }
};