var map = [];

$(function() {
    var canvas = document.getElementById('mapCanvas');
    $('#submit').click(function() {
        map = parse.parseMap($('#map').val());
        if (map.length > 0)
            draw.drawMap(canvas, map);
    });

    $('#solveCNF').click(function() {
        map = parse.parseCNF($('#map').val());
        console.log(map);
        if (map.length > 0)
            $('.area').html(map.join('<br />'));
    });

    $('#findPath_astar').click(function() {
        var start = document.getElementById('start_select');
        var startval = start.options[start.selectedIndex].value;
        console.log("From: (" + map[startval].start.x + ", " + map[startval].start.y + ")");

        var goal = document.getElementById('goal_select');
        var goalval = goal.options[goal.selectedIndex].value;
        console.log("To: (" + map[goalval].end.x + ", " + map[goalval].end.y + ")");
        var path = search.astar(map[startval], map[goalval].end, map, false);
        $('#output').html('<thead>' +
                    '<tr>' +
                        '<th>#</th>' +
                        '<th>Node</th>' +
                        '<th>Street</th>' +
                        '<th>f</th>' +
                        '<th>g</th>' +
                        '<th>h</th>' +
                    '</tr>' +
                '</thead>' +
                '<tbody>');
        console.log(path);
        for (var i = 0; i < path.length; i++) {
            $('#output').append('<tr>' +
                        '<td>' + (i + 1) + '</td>' +
                        '<td>(' + path[i].node.x + ', ' + path[i].node.y + ')</td>' +
                        '<td>' + ((i > 0) ? path[i].name : '') + '</td>' +
                        '<td>' + parseInt(path[i].f).toFixed(2) + '</td>' +
                        '<td>' + parseInt(path[i].g).toFixed(2) + '</td>' +
                        '<td>' + search.heuristic(path[i].node, map[goalval].end) + '</td>' +
                    '<tr>');
        }
        $('#output').append('</tbody>');
    });
    $('#findPath_rbfs').click(function() {
        var start = document.getElementById('start_select');
        var startval = start.options[start.selectedIndex].value;
        console.log("From: (" + map[startval].start.x + ", " + map[startval].start.y + ")");

        var goal = document.getElementById('goal_select');
        var goalval = goal.options[goal.selectedIndex].value;
        console.log("To: (" + map[goalval].end.x + ", " + map[goalval].end.y + ")");
        var path = search.rbfs(map[startval], map[goalval].end, map, true);
        $('#output').html('<thead>' +
                    '<tr>' +
                        '<th>#</th>' +
                        '<th>Node</th>' +
                        '<th>Street</th>' +
                        '<th>f</th>' +
                        '<th>g</th>' +
                        '<th>h</th>' +
                    '</tr>' +
                '</thead>' +
                '<tbody>');
        console.log(path);
        for (var i = 0; i < path.length; i++) {
            $('#output').append('<tr>' +
                        '<td>' + (i + 1) + '</td>' +
                        '<td>(' + path[i].node.x + ', ' + path[i].node.y + ')</td>' +
                        '<td>' + ((i > 0) ? path[i].name : '') + '</td>' +
                        '<td>' + parseInt(path[i].f).toFixed(2) + '</td>' +
                        '<td>' + parseInt(path[i].g).toFixed(2) + '</td>' +
                        '<td>' + search.heuristic(path[i].node, map[goalval].end) + '</td>' +
                    '<tr>');
        }
        $('#output').append('</tbody>');
    });

    if (canvas) {
        canvas.width = document.getElementById('container').clientWidth - 15;
        canvas.height = document.getElementById('container').clientHeight;
    }

    var fileupload = document.getElementById('upload');
    var dropZone = document.getElementById('drop_zone');
    if (fileupload && dropZone) {
        dropZone.addEventListener('drop', fileupload_function, false);
        dropZone.addEventListener('dragover', handleDragOver, false);


        fileupload.addEventListener('change', fileupload_function, false);

        function fileupload_function(e) {
            e.stopPropagation();
            e.preventDefault();
            if (e.target.files)
                var file = e.target.files[0];
            else if (e.dataTransfer.files)
                file = e.dataTransfer.files[0];

            var textType = /text.*/;

            if (file.type.match(textType)) {
                var reader = new FileReader();

                reader.onload = function(e) {
                    var contents = reader.result;
                    map = parse.parseMap(contents);
                    if (map) {
                        draw.drawMap(canvas, map);
                    } else {
                        console.log('Wrong file');
                        alert("Wrong file");
                    }
                };
                reader.readAsText(file);
            } else {
                console.log('File not supported');
                alert('File not supported');
            }
        }
    }
});

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}