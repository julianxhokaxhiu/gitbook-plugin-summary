const Maybe = require('folktale/maybe')

const dirEntry = readmeFilename => ([ dirPath, hasReadme ]) => {
  const depth = getDirDepth(dirPath)
  const title = getDirTitle(dirPath)

  if (hasReadme && depth === 0) {
    return sectionEntries(title)
  } else if (hasReadme) {
    return linkEntries(depth, title, dirPath + readmeFilename)
  } else {
    return disabledEntries(depth, title)
  }
}

const getDirTitle = path =>
  Maybe.of(path.split('/'))
    .chain(x => Maybe.fromNullable(x[x.length - 2]))
    .getOrElse('NO_NAME') // shouldn't happen, right !?

// (String -> Bool) -> [ String, Markdown ] -> String
const fileEntry = isReadme => ([ filePath, parsedMarkdown ]) => {
  if (isReadme(filePath)) return

  const fileTitle = getFileTitle(parsedMarkdown)
  const depth = getFileDepth(filePath)

  return linkEntries(depth, fileTitle, filePath)
}

const getFileTitle = parsedMarkdown =>
  parsedMarkdown
    .chain(m => Maybe.fromNullable(m.headings))
    .map(headings => headings[0])
    .map(title => title.trim())
    .getOrElse('NO_NAME')

const depthEntries = (depth, entries) =>
  Array(depth).join('    ') + entries

const sectionEntries = (title, path) => `\n## ${title}\n`

const disabledEntries = (depth, title) =>
  depthEntries(depth, `- ${title}`)

const linkEntries = (depth, title, path) =>
  depthEntries(depth, `- [${title}](${path})`)

const getFileDepth = path => path.match(/\//g).length

const getDirDepth = path => getFileDepth(path) - 1

const buildSummary = config => entries => {
  const title =
    config.bookTitle
      .map(t => `# ${t}\n\n`)
      .getOrElse('')

  return title + entries.join('\n')
}

module.exports = {
  fileEntry,
  dirEntry,
  buildSummary
}
