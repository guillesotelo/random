const fs = require('fs')
const path = require('path')
const extract = require('markdown-link-extractor')
const readline = require('readline');

// Extecute with:
// sudo node compareWarnings.js /path/to/warnings1.txt /path/to/warnings2.txt

const linksTxt = process.argv[2]
const linksTxt2 = process.argv[3]

console.log('Reading files...')

let txt1 = []
let txt2 = []
let lines = []

const getLinks = () => {
    const fileStream = fs.createReadStream(linksTxt)
    const fileStream2 = fs.createReadStream(linksTxt2)

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    })

    const rl2 = readline.createInterface({
        input: fileStream2,
        crlfDelay: Infinity
    })

    rl.on('line', (line) => {
        txt1.push(line.split('WARNING:')[1])
    })

    rl2.on('line', (line) => {
        txt2.push(line.split('WARNING:')[1])
    })

    rl.on('close', () => {
        rl2.on('close', () => {
            txt1.forEach(line => {
                if (!txt2.includes(line)) lines.push(line.split('[myst')[0])
            })
            writeLinkList()
        })
    })

}


const writeLinkList = () => {
    fs.writeFileSync(path.join(__dirname, 'warningsComparison.txt'), lines.map((line, index) =>
        `${index + 1}. ${line}`
    ).join('\n'))
    console.log('Done!')
}

getLinks()