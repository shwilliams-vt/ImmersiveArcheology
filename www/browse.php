<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="./css/main.css" rel="stylesheet" />
    <link href="./css/browse.css" rel="stylesheet" />
    <title>Immersive Archeology</title>
</head>
<body>
    <?php include($_SERVER['DOCUMENT_ROOT']."/includes/header.php");?>

    <div id="showcase">
        <table id="artifact_showcase">
            <tr>
                <th>ID</th><th>Site ID</th><th>Title</th><th>Description</th><th>Model URL</th><th>Date Excavated</th><th>Location</th>
            </tr>
        </table>
        <table id="dig_site_showcase">
        </table>
    </div>
</body>
</html>

<script type="module">

    import submitGet from "/js/submitget.js";

    function parseTable(t) {
        let rows = t.split(/\<+/g);
        let cells = []
        rows.forEach(cell=>{
            let parsed = cell.split(/\,+/g);
            parsed.pop();
            cells.push(parsed);
        });
        
        cells.shift();
        return cells;
    }

    function createTable(table, id) {
        let parent = document.querySelector("#"+id);
        console.log(parent)

        table.forEach(row=>{

            let rowElem = document.createElement("tr");
            row.forEach(cell=>{
                let d = document.createElement("td");
                d.innerHTML = cell;
                rowElem.appendChild(d)
            })

            parent.appendChild(rowElem);
        })
        
    }

    submitGet(
        "/download.php", 
        [], 
        (t)=>{createTable(parseTable(t), "artifact_showcase")},
        (t)=>{createTable(parseTable(t), "artifact_showcase")}
    );

</script>