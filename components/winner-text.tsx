import Markdoc, { Tag, type Config } from '@markdoc/markdoc'
import React from 'react'

const config: Config = {
  nodes: {
    document: {
      transform(node, config) {
        return node.transformChildren(config)
      },
    },
    link: {
      attributes: { href: { type: String, required: true } },
      transform(node, config) {
        const { href } = node.transformAttributes(config)
        const safe = /^(https?:|mailto:)/i.test(String(href))
        return new Tag(safe ? 'a' : 'span', safe ? { href, rel: 'noreferrer' } : {}, node.transformChildren(config))
      },
    },
  },
}

export function WinnerText({ source }: { source: string }) {
  return <>{Markdoc.renderers.react(Markdoc.transform(Markdoc.parse(source), config), React)}</>
}
