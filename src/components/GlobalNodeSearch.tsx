import { useMemo, useState } from 'react';
import { Filter, Search, X } from 'lucide-react';
import { LEARNING_PATHS, isNodeUnlocked } from '@/config/paths';
import type { NodeDepth, PathCategory, SkillNode } from '@/types';

type SearchResult = { node: SkillNode; pathId: string; pathTitle: string; status: string };

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export default function GlobalNodeSearch({
  completedNodes,
  nodeDepths,
  onSelect,
}: {
  completedNodes: string[];
  nodeDepths: Record<string, NodeDepth>;
  onSelect: (result: SearchResult) => void;
}) {
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pathId, setPathId] = useState('');
  const [category, setCategory] = useState<PathCategory | ''>('');
  const [status, setStatus] = useState('');
  const [duration, setDuration] = useState('');
  const [capstoneOnly, setCapstoneOnly] = useState(false);

  const results = useMemo(() => {
    if (!query.trim() && !pathId && !category && !status && !duration && !capstoneOnly) return [];
    const needle = normalize(query.trim());
    return LEARNING_PATHS.flatMap((path) => path.nodes.map((node) => {
      const depth = nodeDepths[node.id] ?? 0;
      const unlocked = isNodeUnlocked(node, completedNodes);
      const nodeStatus = depth === 3 ? 'master' : depth === 2 ? 'deepen' : depth === 1 ? 'learn' : unlocked ? 'available' : 'locked';
      const haystack = normalize([
        node.title,
        node.description,
        ...(node.applications ?? []),
        node.depthTopics?.learn ?? '',
        node.depthTopics?.deepen ?? '',
        node.depthTopics?.master ?? '',
        path.title,
      ].join(' '));
      const durationMatch = !duration
        || (duration === 'short' && node.estimatedMinutes <= 15)
        || (duration === 'medium' && node.estimatedMinutes > 15 && node.estimatedMinutes <= 25)
        || (duration === 'long' && node.estimatedMinutes > 25);
      if (needle && !haystack.includes(needle)) return null;
      if (pathId && path.id !== pathId) return null;
      if (category && path.category !== category) return null;
      if (status && nodeStatus !== status) return null;
      if (!durationMatch || (capstoneOnly && !node.capstone)) return null;
      return { node, pathId: path.id, pathTitle: path.title, status: nodeStatus };
    })).filter((result): result is SearchResult => result !== null).slice(0, 20);
  }, [query, pathId, category, status, duration, capstoneOnly, completedNodes, nodeDepths]);

  const clear = () => {
    setPathId('');
    setCategory('');
    setStatus('');
    setDuration('');
    setCapstoneOnly(false);
  };

  return (
    <section className="global-search">
      <div className="global-search__bar">
        <Search size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search 150+ skills…" />
        {query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={16} /></button>}
        <button className={filtersOpen ? 'active' : ''} onClick={() => setFiltersOpen((current) => !current)} aria-label="Search filters">
          <Filter size={17} />
        </button>
      </div>
      {filtersOpen && (
        <div className="global-search__filters">
          <select value={pathId} onChange={(event) => setPathId(event.target.value)}>
            <option value="">All paths</option>
            {LEARNING_PATHS.map((path) => <option key={path.id} value={path.id}>{path.title}</option>)}
          </select>
          <select value={category} onChange={(event) => setCategory(event.target.value as PathCategory | '')}>
            <option value="">All categories</option>
            {['Foundations', 'Development', 'Infrastructure', 'Architecture', 'Specializations'].map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Any status</option>
            <option value="available">Available</option><option value="locked">Locked</option>
            <option value="learn">Learn</option><option value="deepen">Deepen</option><option value="master">Master</option>
          </select>
          <select value={duration} onChange={(event) => setDuration(event.target.value)}>
            <option value="">Any duration</option><option value="short">≤ 15 min</option><option value="medium">16–25 min</option><option value="long">25+ min</option>
          </select>
          <label><input type="checkbox" checked={capstoneOnly} onChange={(event) => setCapstoneOnly(event.target.checked)} /> Capstones</label>
          <button className="btn btn-ghost btn-sm" onClick={clear}>Clear filters</button>
        </div>
      )}
      {results.length > 0 && (
        <div className="global-search__results">
          {results.map((result) => (
            <button key={result.node.id} onClick={() => {
              onSelect(result);
              setQuery('');
              setFiltersOpen(false);
            }}>
              <span>{result.node.icon}</span>
              <span><strong>{result.node.title}</strong><small>{result.pathTitle} · {result.status} · {result.node.estimatedMinutes} min</small></span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
