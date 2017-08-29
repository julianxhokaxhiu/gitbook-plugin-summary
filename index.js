const fs = require('fs'),
      glob = require('glob'),
      jsonMark = require('jsonmark'),
      path = require('path')

function generateEntry( title, path, readmeFilename ) {
  let depth = path.match(/\//g).length

  if ( path.indexOf( readmeFilename ) == -1 )
    depth++

  return `${Array(depth).join('    ')}- [${title}](${path})\n`
}

module.exports = {
  hooks: {
    init: function () {
      const root = this.resolve(''),
            bookTitle = this.config.get('title'),
            readmeFilename = this.config.get('structure.readme'),
            summaryFilename = this.config.get('structure.summary'),
            opts = this.config.get('pluginsConfig.summary')

      glob(
        `*/**/*.md`,
        {
          cwd: root
        },
        ( err, files ) => {
          let summaryContent = ( bookTitle ? `# ${bookTitle}\n\n` : '' )

          files.forEach( ( filePath ) => {
            const markdown = jsonMark.parse( fs.readFileSync( `${root}/${filePath}`, { encoding: 'utf8' } ) ),
                  fileTitle = markdown.order[0]

            summaryContent += generateEntry( fileTitle, filePath, readmeFilename )
          })

          fs.writeFileSync( `${root}/${summaryFilename}`, summaryContent, { encoding: 'utf8' } )

          console.log(`\x1b[36mgitbook-plugin-summary: \x1b[32m${summaryFilename} generated successfully.`)
        }
      )
    }
  }
}
