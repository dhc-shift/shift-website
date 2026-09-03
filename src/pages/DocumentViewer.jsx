import React, { useEffect, useState } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase.js';

export default function DocumentViewer({ documents = [] }) {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const document = documents.find(item => String(item.id) === String(documentId));
  const [html, setHtml] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!document) return;
    let cancelled = false;
    setHtml('');
    setError('');

    supabase.storage.from('documents').download(document.file_path).then(async ({ data, error: downloadError }) => {
      if (cancelled) return;
      if (downloadError || !data) {
        setError('자료를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
        return;
      }
      setHtml(await data.text());
    });

    return () => { cancelled = true; };
  }, [document?.id, document?.file_path]);

  if (!document) return <section className="document-viewer-state"><p>자료를 찾는 중입니다.</p></section>;

  return <section className="document-viewer-page">
    <div className="document-viewer-toolbar container">
      <button type="button" onClick={() => navigate('/board?category=자료실')}><ArrowLeft/> 자료실로 돌아가기</button>
      <strong>{document.title}</strong>
      <a href={document.file_url} download><Download/> 원본 다운로드</a>
    </div>
    {error
      ? <div className="document-viewer-state"><p>{error}</p></div>
      : html
        ? <iframe className="document-frame" title={document.title} srcDoc={html} sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"/>
        : <div className="document-viewer-state"><p>자료를 불러오는 중입니다.</p></div>}
  </section>;
}
