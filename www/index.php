<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="/css/main.css" rel="stylesheet" />
    <title>Immersive Archeology</title>
</head>
<body>
    <?php include($_SERVER['DOCUMENT_ROOT']."/includes/header.php");?>
    <div id="wrapper"> 
        <div id="main" style="height:calc(50vh - 50px)">
            <h2>Choose your experience</h2>
            <ul>
                <li><a href="/browse.php">Browse All</a></li>
                <li><a href="/upload/">Upload</a></li>
            </ul>
        </div>
    </div>
    <div id="card-wrapper">
    </div>
</body>
</html>

<script type="module">

    import submitGet from "/js/submitget.js";
    import parseTable from "/js/tableparser.js";


    function createCard(table, id) {
        let parent = document.querySelector("#"+id);

        table.forEach(row=>{

            let rowElem = document.createElement("div");
            rowElem.classList.add("card");

            let title = document.createElement("h2");
            let ta = document.createElement("a");
            ta.setAttribute("href", "/dig_site.php?id=" + row[0]);
            ta.innerText = row[1];
            title.appendChild(ta);
            rowElem.appendChild(title);

            let description = document.createElement("p");
            description.classList.add("description");
            description.innerText = row[2];
            rowElem.appendChild(description);

            let fadeout = document.createElement("div");
            fadeout.classList.add("fadeout");
            description.appendChild(fadeout);

            let date = document.createElement("p");
            date.classList.add("date");
            date.innerText = "From " + row[4] + " to " + row[5];
            rowElem.appendChild(date);

            let siteid = document.createElement("p");
            siteid.classList.add("siteid");
            siteid.innerText = "Site ID: " + row[0];
            rowElem.appendChild(siteid);


            parent.appendChild(rowElem);
        })
        
    }

    submitGet(
        "/inc/download_dig_sites.php", 
        [], 
        (t)=>{createCard(parseTable(t), "card-wrapper")},
        (t)=>{createCard(parseTable(t), "card-wrapper")}
    );

</script>