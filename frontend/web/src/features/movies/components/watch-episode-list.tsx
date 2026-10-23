'use client'

import Link from 'next/link'
import { useState } from 'react'
import { routes } from '@/config/routes'
import { catalogEpisodeSlug } from '@/lib/slug'
import type { CatalogEpisode } from '@/features/movies/types/catalog-movie'

const EPISODES_PER_GROUP = 12

export function WatchEpisodeList({ movieSlug, partName, episodes, selectedEpisodeId }: {
  movieSlug: string;
  partName: string;
  episodes: CatalogEpisode[];
  selectedEpisodeId: string | number;
}) {
  const selectedIndex = Math.max(episodes.findIndex((episode) => episode.id === selectedEpisodeId), 0)
  const [groupIndex, setGroupIndex] = useState(Math.floor(selectedIndex / EPISODES_PER_GROUP))
  const groupCount = Math.ceil(episodes.length / EPISODES_PER_GROUP)
  const visibleEpisodes = episodes.slice(groupIndex * EPISODES_PER_GROUP, (groupIndex + 1) * EPISODES_PER_GROUP)
  const groups = Array.from({ length: groupCount }, (_, index) => ({
    index,
    label: `${index * EPISODES_PER_GROUP + 1}–${Math.min((index + 1) * EPISODES_PER_GROUP, episodes.length)}`,
  }))

  return (
    <>
      {groupCount > 1 && (groupCount <= 4 ? (
        <div className="cine-watch-ranges" aria-label={`Nhóm tập ${partName}`}>
          {groups.map((group) => (
            <button key={group.index} type="button" aria-pressed={groupIndex === group.index} className={groupIndex === group.index ? 'is-active' : ''} onClick={() => setGroupIndex(group.index)}>
              {group.label}
            </button>
          ))}
        </div>
      ) : (
        <label className="cine-watch-range-select">Nhóm tập
          <select value={groupIndex} onChange={(event) => setGroupIndex(Number(event.target.value))}>
            {groups.map((group) => <option key={group.index} value={group.index}>Tập {group.label}</option>)}
          </select>
        </label>
      ))}
      <ol className="cine-watch-episode-list" aria-label={`Các tập ${partName}, nhóm ${groupIndex + 1}`}>
        {visibleEpisodes.map((episode) => (
          <li key={episode.id}>
            <Link href={routes.site.watchEpisode(movieSlug, episode.slug ?? catalogEpisodeSlug(partName, episode.number))} className={selectedEpisodeId === episode.id ? 'is-active' : ''} aria-current={selectedEpisodeId === episode.id ? 'page' : undefined} aria-label={`Xem tập ${episode.number}: ${episode.title}, ${episode.duration}`}>
              <span className="cine-watch-episode-number">{episode.number}</span>
            </Link>
          </li>
        ))}
      </ol>
    </>
  )
}
