$(function() {
    $('#submit').click(function() {
        parseMapToJson($('#map').val());
    });
});

function parseMapToJson(text) {
    var split = text.split('\n');
    var json = [];
    $.each(split, function(key, value) {
        var svalue = value.split(' ');

        // Check for robustness.
        // Coordinates have to be integers.
        if (svalue.length == 5 &&
            svalue[0] == parseInt(svalue[0]) && svalue[1] == parseInt(svalue[1]) &&
            svalue[3] == parseInt(svalue[3]) && svalue[4] == parseInt(svalue[4])) {
            var tmp = {};
            tmp[svalue[2]] = {
                "x1": svalue[0],
                "y1": svalue[1],
                "x2": svalue[3],
                "y2": svalue[4]
            };
            json.push(tmp);
        }
    });
    console.log(json);
}