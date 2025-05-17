import { expect, test, describe } from 'vitest'
import MediainfoParser from '../mediainfoParser'

const movMediaInfo = `
General
Complete name                            : Screen Recording 2025-02-12 at 4.04.38 PM.mov
Format                                   : MPEG-4
Format profile                           : QuickTime
Codec ID                                 : qt   0000.00 (qt  )
File size                                : 155 MiB
Duration                                 : 31 s 750 ms
Overall bit rate                         : 41.0 Mb/s
Frame rate                               : 56.277 FPS
Recorded date                            : 2025-02-12T16:04:40-0800
Encoded date                             : 2025-02-13 00:04:41 UTC
Tagged date                              : 2025-02-13 00:05:13 UTC
Writing application                      : macOS 14.7 (23H124)
Writing library                          : Apple QuickTime
Writing hardware                         : Apple Mac15,7

Video
ID                                       : 1
Format                                   : AVC
Format/Info                              : Advanced Video Codec
Format profile                           : Main@L5.1
Format settings                          : CABAC / 2 Ref Frames
Format settings, CABAC                   : Yes
Format settings, Reference frames        : 2 frames
Codec ID                                 : avc1
Codec ID/Info                            : Advanced Video Coding
Duration                                 : 31 s 750 ms
Source duration                          : 32 s 233 ms
Bit rate                                 : 40.0 Mb/s
Width                                    : 3 456 pixels
Height                                   : 2 234 pixels
Display aspect ratio                     : 3:2
Frame rate mode                          : Variable
Frame rate                               : 56.277 FPS
Minimum frame rate                       : 30.000 FPS
Maximum frame rate                       : 60.000 FPS
Color space                              : YUV
Chroma subsampling                       : 4:2:0 (Type 1)
Bit depth                                : 8 bits
Scan type                                : Progressive
Bits/(Pixel*Frame)                       : 0.092
Stream size                              : 152 MiB (98%)
Source stream size                       : 152 MiB (98%)
Title                                    : Core Media Video
Writing library                          : H.264
Encoded date                             : 2025-02-13 00:04:41 UTC
Tagged date                              : 2025-02-13 00:05:13 UTC
Color range                              : Limited
Color primaries                          : BT.709
Transfer characteristics                 : BT.709
Matrix coefficients                      : BT.709
Codec configuration box                  : avcC

Audio
ID                                       : 2
Format                                   : AAC LC
Format/Info                              : Advanced Audio Codec Low Complexity
Codec ID                                 : 2 / 40 / mp4a-40-2
Duration                                 : 31 s 750 ms
Source duration                          : 31 s 808 ms
Bit rate mode                            : Constant
Bit rate                                 : 128 kb/s
Channel(s)                               : 1 channel
Channel layout                           : M
Sampling rate                            : 48.0 kHz
Frame rate                               : 46.875 FPS (1024 SPF)
Compression mode                         : Lossy
Stream size                              : 498 KiB (0%)
Source stream size                       : 499 KiB (0%)
Title                                    : Core Media Audio
Encoded date                             : 2025-02-13 00:04:41 UTC
Tagged date                              : 2025-02-13 00:05:13 UTC

`

describe('mediainfoParser', () => {
  test('parses video mediainfo output', () => {
    const parser = new MediainfoParser()
    expect(parser.parse(movMediaInfo)).toMatchSnapshot()
  })
})
