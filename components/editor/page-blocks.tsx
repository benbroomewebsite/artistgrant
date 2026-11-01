'use client'

import { type ComponentType, useEffect, useRef, useState } from 'react'
import type { BannerProps, PageBlocksProps } from '@/lib/editor-blocks'
import { displayImageUrl } from '@/lib/image-source'
import { mediaUrl } from '@/lib/media-url'
import styles from './page-blocks.module.css'

type Block = PageBlocksProps['elements'][number]
type Kind = Block['discriminant']
type Section = { indexes: number[]; intro: boolean }

const addable: { kind: Kind; label: string }[] = [
  { kind: 'artist', label: 'Artist name' },
  { kind: 'text', label: 'Text' },
  { kind: 'image', label: 'Image' },
  { kind: 'video', label: 'Video file' },
  { kind: 'embed', label: 'YouTube or Vimeo' },
  { kind: 'divider', label: 'Divider line' },
]

const kindLabel = (kind: Kind) => addable.find((item) => item.kind === kind)!.label

function summary(block: Block) {
  switch (block.discriminant) {
    case 'artist': return block.value.fields.name.value || 'No name yet'
    case 'text': return block.value.fields.content.value.doc.textContent.slice(0, 140) || 'No text yet'
    case 'image': return block.value.fields.alt.value || block.value.fields.upload.value?.filename || block.value.fields.src.value.split('/').pop() || 'No image yet'
    case 'video': return block.value.fields.title.value || block.value.fields.upload.value?.filename || block.value.fields.src.value.split('/').pop() || 'No video yet'
    case 'embed': return block.value.fields.title.value || block.value.fields.url.value || 'No address yet'
    default: return ''
  }
}

function isEmpty(block: Block) {
  switch (block.discriminant) {
    case 'artist': return !block.value.fields.name.value
    case 'text': return !block.value.fields.content.value.doc.textContent
    case 'image': return !block.value.fields.upload.value && !block.value.fields.src.value
    case 'video': return !block.value.fields.upload.value && !block.value.fields.src.value
    case 'embed': return !block.value.fields.url.value
    default: return false
  }
}

// A divider closes a section, so a section is usually one artist. Text at the very
// top is the page's introduction and stays out of the artist order.
function sectionsOf(elements: PageBlocksProps['elements']) {
  const sections: Section[] = []
  let current: number[] = []
  elements.forEach((block, index) => {
    if (index === 0 && block.discriminant === 'text') {
      sections.push({ indexes: [0], intro: true })
      return
    }
    current.push(index)
    if (block.discriminant === 'divider') {
      sections.push({ indexes: current, intro: false })
      current = []
    }
  })
  if (current.length) sections.push({ indexes: current, intro: false })
  return sections
}

function useUploadUrl(upload: { data: Uint8Array } | null) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    if (!upload) { setUrl(''); return }
    const next = URL.createObjectURL(new Blob([new Uint8Array(upload.data)]))
    setUrl(next)
    return () => URL.revokeObjectURL(next)
  }, [upload])
  return url
}

function Picture({ upload, src, className }: { upload: { data: Uint8Array } | null; src: string; className?: string }) {
  const uploaded = useUploadUrl(upload)
  const stored = src ? displayImageUrl(mediaUrl(src), 320) : ''
  const shown = upload ? uploaded : stored
  return <div className={`${styles.picture} ${className ?? ''}`}>{shown ? <img src={shown} alt="" loading="lazy" draggable={false} /> : <span>No picture</span>}</div>
}

function Preview({ block }: { block: Block }) {
  if (block.discriminant === 'image') return <Picture upload={block.value.fields.upload.value} src={block.value.fields.src.value} />
  const symbol = { artist: 'Aa', text: '¶', video: '▶', embed: '▶', divider: '—', image: '' }[block.discriminant]
  return <div className={styles.picture} aria-hidden="true"><span className={styles.symbol}>{symbol}</span></div>
}

export function PageBlocksInput({ elements, onChange, forceValidation = false }: PageBlocksProps) {
  const dragged = useRef<string | null>(null)
  const [over, setOver] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const seen = useRef(new Set<string>())
  const [opened, setOpened] = useState<ReadonlySet<string>>(new Set())
  const sections = sectionsOf(elements)

  // A block opens when it first appears empty, then stays as the editor leaves it,
  // so filling in its first field does not close it mid-edit.
  useEffect(() => {
    const fresh = elements.filter((block) => !seen.current.has(block.key))
    fresh.forEach((block) => seen.current.add(block.key))
    const empty = fresh.filter(isEmpty).map((block) => block.key)
    if (empty.length) setOpened((current) => new Set([...current, ...empty]))
  }, [elements])

  const keys = () => elements.map((block) => ({ key: block.key }) as { key: string | undefined; value?: { discriminant: Kind } })

  const move = (key: string, to: number) => {
    const from = elements.findIndex((block) => block.key === key)
    if (from < 0 || to < 0 || to >= elements.length || from === to) return
    const next = keys()
    next.splice(to, 0, next.splice(from, 1)[0])
    onChange(next as never)
    setAnnouncement(`Moved from position ${from + 1} to ${to + 1}. Press Save to keep this order.`)
  }

  // Dividers keep their places and the artists swap between them, so moving the
  // last artist, which may have no divider of its own, cannot merge two artists.
  const moveSection = (from: number, to: number) => {
    const movable = sections.map((section) => section.indexes.filter((index) => elements[index].discriminant !== 'divider'))
    const dividers = sections.map((section) => section.indexes.find((index) => elements[index].discriminant === 'divider'))
    ;[movable[from], movable[to]] = [movable[to], movable[from]]
    const order = movable.flatMap((indexes, position) => dividers[position] === undefined ? indexes : [...indexes, dividers[position]!])
    onChange(order.map((index) => ({ key: elements[index].key })) as never)
    setAnnouncement('Artist moved. Press Save to keep this order.')
  }

  const remove = (block: Block, label: string) => {
    if (window.confirm(`Remove “${label}” from this page?`)) onChange(keys().filter((item) => item.key !== block.key) as never)
  }

  const insert = (position: number, kinds: Kind[]) => {
    const next = keys()
    next.splice(position, 0, ...kinds.map((kind) => ({ key: undefined, value: { discriminant: kind } })))
    onChange(next as never)
  }

  // New blocks go inside the section, above its divider.
  const insertAtEndOf = (section: Section, kind: Kind) => {
    const last = section.indexes[section.indexes.length - 1]
    insert(elements[last].discriminant === 'divider' ? last : last + 1, [kind])
  }

  const addArtist = () => {
    const needsDivider = elements.length > 0 && elements[elements.length - 1].discriminant !== 'divider'
    insert(elements.length, [...(needsDivider ? ['divider' as const] : []), 'image', 'artist', 'text', 'divider'])
  }

  const row = (index: number) => {
    const block = elements[index]
    const label = summary(block) || kindLabel(block.discriminant)
    const { src: _hidden, ...editable } = (block.discriminant === 'divider' ? {} : block.value.fields) as Record<string, { schema: { Input: ComponentType<Record<string, unknown>> }; value: unknown; onChange: unknown }>
    return <article key={block.key} className={`${styles.block} ${over === block.key ? styles.over : ''}`}
      onDragOver={(event) => { if (dragged.current) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setOver(block.key) } }}
      onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOver(null) }}
      onDrop={(event) => { event.preventDefault(); if (dragged.current) move(dragged.current, index); dragged.current = null; setOver(null) }}>
      <div className={styles.row}>
        <div className={styles.handle} draggable tabIndex={0} role="button" aria-label={`Drag ${kindLabel(block.discriminant)}: ${label}. Use Alt and the arrow keys to move.`}
          onKeyDown={(event) => { if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) { event.preventDefault(); move(block.key, index + (event.key === 'ArrowUp' ? -1 : 1)) } }}
          onDragStart={(event) => { dragged.current = block.key; event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', block.key) }}
          onDragEnd={() => { dragged.current = null; setOver(null) }}>
          <span aria-hidden="true">⠿</span>
          <Preview block={block} />
        </div>
        <div className={styles.label}><strong>{kindLabel(block.discriminant)}</strong>{block.discriminant !== 'divider' && <p title={label}>{label}</p>}</div>
        <div className={styles.actions}>
          <button type="button" disabled={index === 0} aria-label={`Move ${label} up`} onClick={() => move(block.key, index - 1)}>↑</button>
          <button type="button" disabled={index === elements.length - 1} aria-label={`Move ${label} down`} onClick={() => move(block.key, index + 1)}>↓</button>
          <button type="button" aria-label={`Remove ${label}`} onClick={() => remove(block, label)}>Remove</button>
        </div>
      </div>
      {block.discriminant !== 'divider' && <details className={styles.details} open={forceValidation || opened.has(block.key)} onToggle={(event) => {
        const isOpen = event.currentTarget.open
        setOpened((current) => {
          if (current.has(block.key) === isOpen) return current
          const next = new Set(current)
          if (isOpen) next.add(block.key)
          else next.delete(block.key)
          return next
        })
      }}>
        <summary>Edit</summary>
        <div className={styles.fields}>{Object.entries(editable).map(([key, field]) => {
          const Input = field.schema.Input
          return <Input key={key} value={field.value} onChange={field.onChange} autoFocus={false} forceValidation={forceValidation} />
        })}</div>
      </details>}
    </article>
  }

  return <section className={styles.page} aria-label="Page content">
    <h3 className={styles.heading}>Page content <span>({elements.length})</span></h3>
    <p className={styles.help}>This list runs in the same order as the page. Drag a block by its handle or use its arrows to change the order, and use “Move artist” to shift a whole artist. Press Save at the top when you are finished. The site updates a minute or two later.</p>
    {sections.map((section, position) => {
      const name = section.indexes.map((index) => elements[index]).find((block) => block.discriminant === 'artist')
      const title = section.intro ? 'Introduction' : name?.discriminant === 'artist' && name.value.fields.name.value || `Section ${position + 1}`
      const previous = sections[position - 1]
      const next = sections[position + 1]
      return <div className={styles.section} key={elements[section.indexes[0]].key}>
        <div className={styles.sectionHeading}>
          <h4>{title}</h4>
          {!section.intro && <div className={styles.actions}>
            <button type="button" disabled={!previous || previous.intro} aria-label={`Move all of ${title} up`} onClick={() => moveSection(position, position - 1)}>↑ Move artist</button>
            <button type="button" disabled={!next} aria-label={`Move all of ${title} down`} onClick={() => moveSection(position, position + 1)}>↓ Move artist</button>
          </div>}
        </div>
        {section.indexes.map(row)}
        {!section.intro && <div className={styles.add} role="group" aria-label={`Add to ${title}`}>
          <span>Add:</span>
          {addable.filter((item) => item.kind !== 'divider').map((item) => <button type="button" key={item.kind} onClick={() => insertAtEndOf(section, item.kind)}>{item.label}</button>)}
        </div>}
      </div>
    })}
    {!elements.length && <p className={styles.empty}>This page has no content yet. Start by adding an artist.</p>}
    <div className={styles.addArtist}>
      <button type="button" onClick={addArtist}>+ New artist</button>
      <button type="button" onClick={() => insert(elements.length, ['divider'])}>+ Divider line</button>
    </div>
    <p className={styles.status} role="status" aria-live="polite">{announcement}</p>
  </section>
}

export function BannerInput({ fields, forceValidation = false, label, description }: BannerProps & { label: string; description: string }) {
  const Upload = fields.upload.schema.Input
  return <section className={styles.banner} aria-label={label}>
    <h3 className={styles.heading}>{label}</h3>
    <p className={styles.help}>{description}</p>
    <Picture className={styles.bannerPicture} upload={fields.upload.value} src={fields.src.value} />
    <Upload value={fields.upload.value} onChange={fields.upload.onChange} autoFocus={false} forceValidation={forceValidation} />
  </section>
}
