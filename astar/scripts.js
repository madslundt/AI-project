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
        console.log("From: (" + map[startval].start.x + ", " + map[startval].start.y + ")");

        var goal = document.getElementById('goal_select');
        var goalval = goal.options[goal.selectedIndex].value;
        console.log("To: (" + map[goalval].end.x + ", " + map[goalval].end.y + ")");
        astar.search(map[startval], map[goalval].start, map, true);
    });


    canvas.width = document.getElementById('container').clientWidth;
    canvas.height = document.getElementById('container').clientHeight;

    var fileupload = document.getElementById('upload');
    var dropZone = document.getElementById('drop_zone');
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
            }

            reader.readAsText(file);
        } else {
            console.log('File not supported');
            alert('File not supported');
        }
    }
});

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}