import { useEffect, useState } from 'react';
import { Check, Loader, NotebookPen } from 'lucide-react';
import {
  getContentNote,
  saveContentNote,
  type NoteContentType,
} from '@/services/contentNotesService';

export default function ContentNotes({
  contextId,
  contentType,
}: {
  contextId: string;
  contentType: NoteContentType;
}) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getContentNote(contextId, contentType)
      .then((value) => active && setNote(value))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [contextId, contentType]);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await saveContentNote(contextId, contentType, note);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="content-notes">
      <div className="content-notes__header">
        <strong><NotebookPen size={16} /> Minhas anotações</strong>
        <button className="btn btn-secondary btn-sm" disabled={loading || saving} onClick={save}>
          {saving ? <Loader size={14} className="animate-spin" /> : saved ? <Check size={14} /> : null}
          {saved ? 'Salvo' : 'Salvar'}
        </button>
      </div>
      <textarea
        className="content-notes__input"
        value={note}
        disabled={loading}
        placeholder={loading ? 'Carregando anotações...' : 'Escreva observações, dúvidas e lembretes...'}
        onChange={(event) => {
          setNote(event.target.value);
          setSaved(false);
        }}
      />
    </section>
  );
}
