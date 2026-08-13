(() => {
  const form = document.querySelector('#photo-submit-form');
  if (!form) return;

  const fileInput = document.querySelector('#photo-file');
  const status = document.querySelector('#submit-status');
  const button = form.querySelector('button[type="submit"]');
  const endpoint = 'https://xagrwinvrsjhtyxtnyrh.supabase.co/storage/v1/object/naoking-photos';
  const publicKey = 'sb_publishable_JDX8Rc_mXOOd_F2WHnmzKw_VMKq2Wta';
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxBytes = 10 * 1024 * 1024;
  const cooldownMs = 30 * 1000;

  function setStatus(message, tone = '') {
    status.textContent = message;
    status.className = `submit-status ${tone}`.trim();
  }

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    setStatus(file ? `選択中：${file.name}` : '選んだ写真は、王様が気まぐれに確認します。');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const file = fileInput.files[0];
    if (!file) return setStatus('まず写真を選んでください。', 'is-error');
    if (!allowedTypes.includes(file.type)) return setStatus('JPEG、PNG、WebPだけ送れます。サメの決まりです。', 'is-error');
    if (file.size > maxBytes) return setStatus('10MBを超えています。少し軽くしてから送ってください。', 'is-error');
    const lastUpload = Number(localStorage.getItem('naokingLastUpload') || 0);
    if (Date.now() - lastUpload < cooldownMs) return setStatus('連投しすぎです。30秒ほど待ってください。', 'is-error');

    const extension = file.name.split('.').pop().replace(/[^a-z0-9]/gi, '').toLowerCase() || 'jpg';
    const safeName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
    button.disabled = true;
    setStatus('なおキングが写真を受け取っています…');
    try {
      const response = await fetch(`${endpoint}/${safeName}`, {
        method: 'POST',
        headers: { apikey: publicKey, Authorization: `Bearer ${publicKey}`, 'Content-Type': file.type, 'x-upsert': 'false' },
        body: file
      });
      if (!response.ok) throw new Error('upload failed');
      localStorage.setItem('naokingLastUpload', String(Date.now()));
      form.reset();
      setStatus('献上完了。なおキングが気まぐれに確認します。', 'is-success');
    } catch {
      setStatus('送信に失敗しました。少し待ってもう一度試してください。', 'is-error');
    } finally {
      button.disabled = false;
    }
  });
})();
