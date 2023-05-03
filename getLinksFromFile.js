const fs = require('fs')
const path = require('path')
const extract = require('markdown-link-extractor')
const readline = require('readline');

// Extecute with:
// <script> <path-to-folder> <path-to-file-with-links>
// sudo node getLinks.js /home/user/Portal/repos/hp-developer-portal/Tools/ /home/user/Portal/temp/links.txt # or path to desired folder and file

const folderPath = process.argv[2]
const linksTxt = process.argv[3]

console.log('Reading files...')

const findMarkdownFiles = (dirPath, fileList) => {
    const files = fs.readdirSync(dirPath)

    files.forEach((file) => {
        const filePath = path.join(dirPath, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory()) {
            findMarkdownFiles(filePath, fileList)
        } else if (path.extname(file) === '.md') {
            fileList.push(filePath)
        }
    })

    return fileList
}

let markdownFiles = findMarkdownFiles(folderPath, [])
let links = []
let fileContents = []
let parsedLinks = []

const getLinks = () => {
    let extractedLinks = []
    const fileStream = fs.createReadStream(linksTxt)
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    })

    rl.on('line', (line) => {
        if (line.includes('Not found')) {
            extractedLinks.push({
                path: line.split('.md')[0] + '.md',
                link: 'http' + line.split('http')[1]
            })
        }
    })

    rl.on('close', () => {
        console.log('Finished reading the file.')

        extractedLinks.forEach(obj => {
            const lastSlash = obj.link.substring(obj.link.lastIndexOf("/") + 1, obj.link.length)
            if (lastSlash.includes('#')) links.push(obj)
        })
        markdownFiles.forEach(path => {
            const content = fs.readFileSync(path, 'utf-8')
            fileContents.push(content)
        })
        findLocalPathToLinks()
        writeLinkList()
    })
}

const findLocalPathToLinks = () => {

    let usedLinks = []
    let usedPaths = []

    links.forEach(obj => {
        let found = true
        const titleId = obj.link.substring(obj.link.lastIndexOf("#"), obj.link.length)
        const title = titleId.replace(/[#_-]/g, ' ')

        fileContents.forEach((content, index) => {
            if (content.toLowerCase().includes('#' + title.toLowerCase())) {
                if (!usedLinks.includes(obj.link) && !usedPaths.includes(obj.path)) {
                    parsedLinks.push({ ...obj, newPath: markdownFiles[index] + `${titleId}` })
                }
                else found = false
            }
        })

        if (!found) parsedLinks.push({ ...obj, newPath: `Not found within the folder: ${folderPath}` })
    })
}

const writeLinkList = () => {
    const listTitle = `Links found in ${folderPath}\n\n`
    fs.writeFileSync(path.join(folderPath, 'link-list2.txt'), listTitle + parsedLinks.map(({ path, newPath, link }) =>
        `${path}\n${link}\n${newPath}\n`
    ).join('\n'))
    console.log('Done!')
}

getLinks()