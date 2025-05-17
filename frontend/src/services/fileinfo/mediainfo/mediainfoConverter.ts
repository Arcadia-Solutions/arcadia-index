import { uniq, compact } from 'lodash-es'
import { AUDIO_OPTION, VIDEO_OPTION } from '../utils'
import type { ParseResult } from './mediainfoParser'

type Resolution = string | [string, string]

export default class MediainfoConverter {
  convert(info: ParseResult) {
    const source = this.extractSource(info)
    const codec = this.extractCodec(info)
    const processing = this.extractProcessing(info, codec)
    const resolution = this.extractResolution(info) // '720p' | ['1', '2']
    const container = this.extractContainer(info, resolution)
    const subtitles = this.extractSubtitle(info) // ['Chinese Simplified']
    const videoOption = this.extractVideoOption(info)
    const audioOption = this.extractAudioOption(info)
    return {
      source,
      codec,
      processing,
      resolution,
      container,
      subtitles,
      videoOption,
      audioOption,
    }
  }

  extractVideoOption(info: ParseResult) {
    const options = new Set()
    for (const v of info['video']) {
      const hdrFormat = v['hdr format']
      const bitDepth = v['bit depth']
      if (hdrFormat && hdrFormat.match(/Dolby Vision/)) {
        options.add(VIDEO_OPTION.DOLBYVISION)
      }
      if (hdrFormat && hdrFormat.match(/HDR10\+/)) {
        options.add(VIDEO_OPTION.HDR10PLUS)
      }
      if (hdrFormat && hdrFormat.match(/HDR/)) {
        options.add(VIDEO_OPTION.HDR10)
      }
      if (bitDepth && bitDepth.match(/10 bits/)) {
        options.add(VIDEO_OPTION.BIT10)
      }
    }
    return Array.from(options)
  }

  extractAudioOption(info: ParseResult) {
    const options = new Set()
    for (const a of info['audio']) {
      const channels = a['channel(s)']
      const commercialName = a['commercial name']
      const format = a['format']
      if (channels && channels.match(/6 channels/)) {
        options.add(AUDIO_OPTION.CHANNEL51)
      }
      if (channels && channels.match(/8 channels/)) {
        options.add(AUDIO_OPTION.CHANNEL71)
      }
      if (commercialName && commercialName.match(/Atmos/)) {
        options.add(AUDIO_OPTION.DOLBYATMOS)
      }
      if (format && format.match(/DTS XLL X/)) {
        options.add(AUDIO_OPTION.DTSX)
      }
    }
    return Array.from(options)
  }

  extractSource(info: ParseResult) {
    const name = info['general']['complete name']
    return /bdrip|blu-?ray|bluray/i.test(name)
      ? 'Blu-ray'
      : /web/i.test(name)
        ? 'WEB'
        : /dvdrip|ifo|vob/i.test(name)
          ? 'DVD'
          : /hdtv/i.test(name)
            ? 'HDTV'
            : /tv/i.test(name)
              ? 'TV'
              : /vhs/i.test(name)
                ? 'VHS'
                : /hddvd/i.test(name)
                  ? 'HD-DVD'
                  : ''
  }

  extractContainer(info: ParseResult, resolution: Resolution) {
    const format = info['general']['format']
    if (!Array.isArray(resolution) && ['PAL', 'NTSC'].includes(resolution)) {
      return 'VOB IFO'
    }

    return /matroska/i.test(format)
      ? 'MKV'
      : /mpe?g-?4/i.test(format)
        ? 'MP4'
        : /mpe?g/i.test(format)
          ? 'MPG'
          : /avi/i.test(format)
            ? 'AVI'
            : /m2ts/i.test(format)
              ? 'm2ts'
              : /dvd/i.test(format)
                ? 'VOB IFO'
                : 'Other'
  }

  extractCodec(info: ParseResult) {
    // V_MPEGH/ISO/HEVC is H265 ?
    const completeName = info['general']['complete name']
    const video = info['video'][0]
    const encodingSettings = video['encoding settings']
    const format = video['format']
    const codecId = video['codec id']
    return format === 'AVC'
      ? encodingSettings
        ? 'x264'
        : 'H.264'
      : format.includes('HEVC')
        ? encodingSettings
          ? 'x265'
          : 'H.265'
        : format.includes('H265')
          ? 'H.265'
          : format === 'MPEG-4 Visual'
            ? codecId === 'XVID'
              ? 'XviD'
              : 'DivX'
            : /dvd5/i.test(completeName)
              ? 'DVD5'
              : /dvd9/i.test(completeName)
                ? 'DVD9'
                : 'Other'
  }

  extractProcessing(info: ParseResult, codec: string) {
    const completeName = info['general']['complete name']
    return /remux/i.test(completeName)
      ? 'Remux'
      : ['x264', 'x265'].includes(codec)
        ? 'Encode'
        : ['H.264', 'H.265'].includes(codec)
          ? 'Untouched'
          : ''
  }

  extractResolution(info: ParseResult): string | [string, string] {
    const completeName = info['general']['complete name']
    const video = info['video'][0]
    const standard = video['standard']
    const scanType = video['scan type']

    const width = Number(video.width && (video.width.match(/[0-9 ]+/)?.[0].replace(/ /g, '') ?? ''))
    const height = Number(
      video.height && (video.height.match(/[0-9 ]+/)?.[0].replace(/ /g, '') ?? ''),
    )

    // 1920x567 -> 1080p
    let resolution: string | [string, string] =
      /2160p/i.test(completeName) || width === 3840
        ? '2160p'
        : /1080i/i.test(completeName) ||
            ((width === 1920 || (Number(width) < 1920 && height === 1080)) &&
              (scanType === 'Interlaced' || scanType === 'MBAFF'))
          ? '1080i'
          : /1080p/i.test(completeName) || width === 1920 || (width < 1920 && height === 1080)
            ? '1080p'
            : /720p/i.test(completeName) || width === 1280 || (width < 1280 && height === 720)
              ? '720p'
              : width === 1024
                ? '576p'
                : standard === 'NTSC'
                  ? 'NTSC'
                  : width === 854 || height === 480
                    ? '480p'
                    : standard === 'PAL'
                      ? 'PAL'
                      : 'Other'

    if (resolution === 'Other' && width && height) {
      resolution = [video.width, video.height] as [string, string]
    }

    return resolution
  }

  extractSubtitle(info: ParseResult) {
    const texts = info['text']
    const subtitles = []
    for (const text of texts) {
      let language = text['language'] || text['title']
      if (!language) {
        continue
      }
      let extra = ''
      if (language.match(/chinese|mandarin/i)) {
        language = 'Chinese'
        const title = compact([text['language'], text['title']]).join('\n')
        extra = title.match(/traditional|繁|cht/i)
          ? ' Traditional'
          : title.match(/simplified|简|chs/i)
            ? ' Simplified'
            : ' Simplified'
      }
      subtitles.push(`${language}${extra}`)
    }
    return uniq(subtitles)
  }
}
