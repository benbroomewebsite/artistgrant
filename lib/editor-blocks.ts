import { createElement } from 'react'
import { fields, type PreviewProps } from '@keystatic/core'
import { BannerInput, PageBlocksInput } from '@/components/editor/page-blocks'

const uploads = { directory: 'public/uploads/winners', publicPath: '/uploads/winners/' }
const optionalWebAddress = { regex: /^(https?:\/\/\S+)?$/, message: 'A full address, starting https://' }

const blocks = fields.blocks({
  artist: {
    label: 'Artist name',
    schema: fields.object({
      name: fields.text({ label: 'Name' }),
      link: fields.text({ label: 'Link', description: 'Optional. The artist’s website or Instagram, starting https://', validation: { pattern: optionalWebAddress } }),
    }),
  },
  text: {
    label: 'Text',
    schema: fields.object({
      content: fields.markdoc.inline({
        label: 'Text',
        options: { bold: true, italic: true, link: true, strikethrough: false, code: false, heading: false, blockquote: false, orderedList: false, unorderedList: false, table: false, image: false, divider: false, codeBlock: false },
      }),
      large: fields.checkbox({ label: 'Larger text', description: 'Use the size of the page’s main text instead of the smaller biography size.' }),
    }),
  },
  image: {
    label: 'Image',
    schema: fields.object({
      upload: fields.image({ label: 'Upload an image', description: 'JPEG, PNG or WebP, ideally no wider than 2400 pixels. Smaller sizes are made automatically.', ...uploads }),
      src: fields.text({ label: 'Existing image path' }),
      alt: fields.text({ label: 'Image description', description: 'Describes the image for screen readers and search engines.' }),
    }),
  },
  video: {
    label: 'Video file',
    schema: fields.object({
      upload: fields.file({ label: 'Upload an MP4', description: 'Short clips only, under 25 MB. Use a YouTube or Vimeo block for anything longer.', ...uploads }),
      src: fields.text({ label: 'Existing video path' }),
      title: fields.text({ label: 'Video description', description: 'Describes the video for screen readers.' }),
    }),
  },
  embed: {
    label: 'YouTube or Vimeo',
    schema: fields.object({
      url: fields.text({ label: 'Video address', description: 'Paste the address from YouTube or Vimeo.', validation: { pattern: optionalWebAddress } }),
      title: fields.text({ label: 'Video title', description: 'Describes the video for screen readers.' }),
    }),
  },
  divider: {
    label: 'Divider line',
    schema: fields.empty(),
  },
}, { label: 'Page content' })

const banner = fields.object({
  upload: fields.image({ label: 'Upload a picture', ...uploads }),
  src: fields.text({ label: 'Existing picture path' }),
})

export type PageBlocksProps = PreviewProps<typeof blocks> & { forceValidation?: boolean }
export type BannerProps = PreviewProps<typeof banner> & { forceValidation?: boolean }

// Keep Keystatic's native array/asset serialization and GitHub save flow.
export const pageBlocks = {
  ...blocks,
  Input(props: unknown) {
    return createElement(PageBlocksInput, props as PageBlocksProps)
  },
}

export function editorBanner(label: string, description: string) {
  const field = fields.object(banner.fields, { label, description })
  return {
    ...field,
    Input(props: unknown) {
      return createElement(BannerInput, { ...(props as BannerProps), label, description })
    },
  }
}
