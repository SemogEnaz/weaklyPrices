import fs from 'node:fs';

export default class CatalogueReader {

    readCsv(dir, fileName) {

        const extension = '.csv'
        const filePath = dir + fileName + extension;

        const data = fs.readFileSync(filePath, 'utf8');
        return this._parseData(data);
    }

    _parseData(data) {

        const items = [];
        const lines = data.split('\r\n');
    
        for (const line of lines) {
    
            const substrings = line.split(',');
    
            const item = {
                name: substrings[0],
                oldPrice: parseFloat(substrings[1]),
                newPrice: parseFloat(substrings[2]),
                link: substrings[3],
            };

            items.push(item);
        }

        // Removing elements
        items.splice(0, 1)                  // First element: headings
        items.splice(items.length - 1, 1)   // Last element: empty

        return items;
    }

    getTopDrops(items, itemCount) {
    
        const sortedItmes = items.sort((a, b) => {
            return (b.oldPrice - b.newPrice) - (a.oldPrice - a.newPrice)
        });
        
        return sortedItmes.slice(0, itemCount);
    }
}