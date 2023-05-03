const fs = require('fs')
const path = require('path')
const extract = require('markdown-link-extractor')

// Extecute with:
// sudo node getLinks.js /home/user/Portal/repos/hp-developer-portal/Tools/ # or path to desired folder

const folderPath = process.argv[2]
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
    markdownFiles.forEach(path => {
        const content = fs.readFileSync(path, 'utf-8')

        fileContents.push(content)

        const extractedLinks = extract(content).links

        extractedLinks.forEach(link => {
            if (link.includes('http')) {
                const lastSlash = link.substring(link.lastIndexOf("/") + 1, link.length)
                if (lastSlash.includes('#')) links.push({ path: path, link })
            }
        })
    })
}

const findLocalPathToLinks = () => {
    links.forEach(obj => {
        let found = true

        fileContents.forEach((content, index) => {
            const title = '# ' + obj.link.substring(obj.link.lastIndexOf("#") + 1, obj.link.length).replace(/[#_-]/g, ' ')

            if (content.toLowerCase().includes(title.toLowerCase())) parsedLinks.push({ link: obj.link, path: 'Found in: ' + markdownFiles[index] })
            else found = false
        })

        if (!found) parsedLinks.push({ link: obj.link, path: `Not found within the folder: ${folderPath}` })
    })
}

const writeLinkList = () => {
    const listTitle = `Links found in ${folderPath}\n\n`
    fs.writeFileSync(path.join(folderPath, 'link-list.txt'), listTitle + parsedLinks.map(({ path, link }) =>
        `${link}\n${path}\n`
    ).join('\n'))
    console.log('Done!')
}

getLinks()
findLocalPathToLinks()
writeLinkList()