// export default function parseTable(t) {
//     let rows = t.split(/\<+/g);
//     let cells = []
//     rows.forEach(cell=>{
//         let parsed = cell.split(/\,+/g);
//         parsed.pop();
//         cells.push(parsed);
//     });
    
//     cells.shift();
//     return cells;
// }

export default function parseTable(t) {

    let json = JSON.parse(t);

    console.log(json)

    let all = [];

    json.forEach(row=>{
        let entry = [];
        Object.values(row).forEach(val=>{
            entry.push(val);
        });
        all.push(entry);
    })

    return all;
}