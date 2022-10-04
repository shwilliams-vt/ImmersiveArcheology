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

    <div id="showcase_wrapper">
        <h2>Dig Sites</h2>
        <table id="dig_site_showcase" class="showcase">
            <tr>
                <th>ID</th><th>Title</th><th>Description</th><th>Model URL</th><th>Date Started Excavated</th><th>Date Ended Excavated</th>
            </tr>
        </table>

        <br/>

        <h2>Artifacts</h2>
        <table id="artifact_showcase" class="showcase">
            <tr>
                <th>ID</th><th>Site ID</th><th>Title</th><th>Description</th><th>Model URL</th><th>Date Excavated</th><th>Location</th>
            </tr>
        </table>
    </div>
</body>
</html>

<script type="module">

    import submitGet from "/js/submitget.js";
    import parseTable from "/js/tableparser.js";


    function createTable(table, id) {
        let parent = document.querySelector("#"+id);

        let is_artifact = id == "artifact_showcase";

        table.forEach(row=>{

            let rowElem = document.createElement("tr");
            row.forEach(cell=>{
                let d = document.createElement("td");
                d.innerHTML = cell;
                rowElem.appendChild(d)
            })

            rowElem.addEventListener("click", function(e) {

                let page;

                if (is_artifact)
                    page = "artifact";
                else
                    page = "dig_site";

                window.location.href = ("/" + page + ".php?id=" + row[0]);
            });

            parent.appendChild(rowElem);
        })
        
    }

    submitGet(
        "/inc/download_artifacts.php", 
        [], 
        (t)=>{createTable(parseTable(t), "artifact_showcase")},
        (t)=>{createTable(parseTable(t), "artifact_showcase")}
    );

    submitGet(
        "/inc/download_dig_sites.php", 
        [], 
        (t)=>{createTable(parseTable(t), "dig_site_showcase")},
        (t)=>{createTable(parseTable(t), "dig_site_showcase")}
    );

</script>