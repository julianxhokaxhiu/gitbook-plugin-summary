const fs = require('fs'),
      glob = require('glob'),
      path = require('path'),
      Parser = require('markdown-parser')

function generateEntry( title, path, isReadme, isFAQ ) {
  if (isReadme && isFAQ)
    return `## ${title}\n`

  const depth = path.match(/\//g).length + (!isReadme && !isFAQ)

  return `${Array(depth).join('    ')}- [${title}](${path})\n`
}

module.exports = {
  hooks: {
    init: function () {
      const parser = new Parser(),
            root = this.resolve(''),
            bookTitle = this.config.get('title'),
            readmeFilename = this.config.get('structure.readme'),
            summaryFilename = this.config.get('structure.summary'),
            isFAQ = this.config.get('plugins').includes('theme-faq')

      let ret = Promise.resolve(),
          summaryContent = ( bookTitle ? `# ${bookTitle}\n\n` : '' )

      const isReadme = path => path.includes(readmeFilename)

      glob(
        `*/**/*.md`,
        {
          cwd: root,
          ignore: ['node_modules/**'],
          nosort: true
        },
        ( err, files ) => {
          files.sort((a, b) => {
            const sameDir = path.dirname(a) == path.dirname(b)
            if (sameDir && isReadme(a))
              return -1
            if (sameDir && isReadme(b))
              return 1
            return a < b ? -1 : a > b ? 1 : 0
          })

          files.forEach( ( filePath ) => {
            ret = ret.then(
              () => {
                return new Promise(
                  ( resolve, reject ) => {
                    parser.parse(
                      fs.readFileSync( `${root}/${filePath}`, { encoding: 'utf8' } ),
                      ( err, result ) => {
                        if ( result.headings.length ) {
                          const fileTitle = result.headings[0].trim()

                          summaryContent += generateEntry( fileTitle, filePath, isReadme(filePath), isFAQ )
                        }

                        resolve()
                      }
                    )
                  }
                )
              }
            )
          })

          ret = ret.then(
            () => {
              fs.writeFileSync( `${root}/${summaryFilename}`, summaryContent, { encoding: 'utf8' } )

              console.log(`\x1b[36mgitbook-plugin-summary: \x1b[32m${summaryFilename} generated successfully.`)

              return Promise.resolve()
            }
          )
        }
      )

      return ret;
    }
  }
}