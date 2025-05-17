import Debug from 'debug'
import { splitIntoLines, splitIntoSections } from '../utils.js'

const debug = Debug('mediainfo')

export interface ParseResult {
  general: Record<string, string>
  video: Record<string, string>[]
  audio: Record<string, string>[]
  text: Record<string, string>[]
  menu: Record<string, string>
}
/*
 * new Mediainfo.parse(rawText)
 * #-> { general: { KEY: VALUE }, video: [..], .. }
 */
export default class MediainfoParser {
  parse(text: string) {
    const result: ParseResult = {
      general: {},
      video: [],
      audio: [],
      text: [],
      menu: {},
    }
    const sections = splitIntoSections(text)
    debug('SECTIONS', sections)
    for (const section of sections) {
      if (!section.match(/([a-zA-Z]+).*\n([\s\S]+)/)) {
        continue
      }
      const [rawSectionName, sectionBody] =
        section.match(/([a-zA-Z]+).*\n([\s\S]+)/)?.slice(1) ?? []
      const sectionName = rawSectionName.toLowerCase() as keyof ParseResult
      const fields = this.extractFields({ sectionName, sectionBody })
      if (Array.isArray(result[sectionName])) {
        result[sectionName].push(fields)
      } else {
        // @ts-expect-error TODO: type isn't narrowing - why?
        result[sectionName] = fields
      }
    }
    return result
  }

  extractFields({
    sectionName: _sectionName,
    sectionBody,
  }: Record<string, string>): Record<string, string> {
    const result: Record<string, string> = {}
    const lines = splitIntoLines(sectionBody)
    for (const line of lines) {
      const found = line.match(/^(.*?):(.*)$/)
      if (!found) {
        continue
      }
      const [key, value] = found.slice(1).map((v: string) => v.trim())
      result[key.toLowerCase()] = value
    }
    return result
  }
}
