import { compact } from 'lodash-es'

export function GB(sizeInBytes: number) {
  return sizeInBytes * 1024 * 1024 * 1024
}

export const AUDIO_OPTION = {
  LOSSLESS: 'audio_lossless',
  CHANNEL51: 'audio_51',
  CHANNEL71: 'audio_71',
  DTSX: 'dtsx',
  DOLBYATMOS: 'dolby_atmos',
}

export const VIDEO_OPTION = {
  BIT10: 'color_10bit',
  HDR10: 'hdr10',
  HDR10PLUS: 'hdr10_plus',
  DOLBYVISION: 'dolby_vision',
}

export const DISK_SIZE = {
  BD25: GB(23.28),
  BD50: GB(46.57),
  BD66: GB(61.47),
  BD100: GB(93.13),
}

export function splitIntoBDInfoSections(text: string) {
  return compact(
    text
      .trim()
      .replace(/\n\r/, '\n')
      .split(/([a-zA-Z ]*:\n)/)
      .map((v) => v.trim()),
  )
}

export function splitIntoSections(text: string) {
  return compact(
    text
      .trim()
      .replace(/\n\r/, '\n')
      .split(/\n\s*\n/)
      .map((v) => v.trim()),
  )
}

export function splitIntoLines(text: string) {
  return compact(
    text
      .trim()
      .replace(/\n\r/, '\n')
      .split(/\n/)
      .map((v) => v.trim()),
  )
}

export function extractBBCode(bbcode: string) {
  const found = bbcode.match(/\[mediainfo\]([\s\S]*?)\[\/mediainfo\]/i)
  if (!found) {
    return
  }
  return found[1].trim()
}

export function removeMediainfoTag(bbcode: string) {
  return bbcode.replace('[mediainfo]', '').replace('[/mediainfo]', '').trim()
}

export function calcDiskType(size: number) {
  if (size <= DISK_SIZE.BD25) {
    return 'BD25'
  } else if (size <= DISK_SIZE.BD50) {
    return 'BD50'
  } else if (size <= DISK_SIZE.BD66) {
    return 'BD66'
  } else if (size <= DISK_SIZE.BD100) {
    return 'BD100'
  }
}
