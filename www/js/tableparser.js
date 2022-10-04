export default function parseTable(t) {
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