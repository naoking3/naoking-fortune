(() => {
  const form = document.querySelector('#photo-submit-form');
  if (!form) return;

  const fileInput = document.querySelector('#photo-file');
  const preview = document.querySelector('#photo-preview');
  const previewName = document.querySelector('#photo-preview-name');
  const status = document.querySelector('#submit-status');
  const button = form.querySelector('button[type="submit"]');
  const creditInput = document.querySelector('#photo-credit');
  const fileDrop = form.querySelector('.file-drop');
  const endpoint = 'https://xagrwinvrsjhtyxtnyrh.supabase.co/storage/v1/object/naoking-photos';
  const metadataEndpoint = 'https://xagrwinvrsjhtyxtnyrh.supabase.co/rest/v1/photo_submissions';
  const publicKey = 'sb_publishable_JDX8Rc_mXOOd_F2WHnmzKw_VMKq2Wta';
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxBytes = 10 * 1024 * 1024;
  const cooldownMs = 30 * 1000;

  function setStatus(message, tone = '') {
    status.textContent = message;
    status.className = `submit-status ${tone}`.trim();
    form.dataset.state = tone.replace('is-', '') || 'idle';
  }

  let previewUrl = '';
  function clearPreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = '';
    preview.removeAttribute('src');
    preview.hidden = true;
    previewName.textContent = '';
    previewName.hidden = true;
  }

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    clearPreview();
    if (file) {
      previewUrl = URL.createObjectURL(file);
      preview.src = previewUrl;
      preview.hidden = false;
      previewName.textContent = `選択中：${file.name}`;
      previewName.hidden = false;
      const megabytes = (file.size / 1024 / 1024).toFixed(file.size > 1024 * 1024 ? 1 : 2);
      setStatus(`選択中：${file.name}（${megabytes}MB）`);
    } else {
      setStatus('選んだ写真は、王様が気まぐれに確認します。');
    }
  });

  ['dragenter', 'dragover'].forEach(type => fileDrop?.addEventListener(type, event => {
    event.preventDefault();
    fileDrop.classList.add('is-dragover');
  }));
  ['dragleave', 'drop'].forEach(type => fileDrop?.addEventListener(type, event => {
    event.preventDefault();
    fileDrop.classList.remove('is-dragover');
  }));
  fileDrop?.addEventListener('drop', event => {
    const [file] = event.dataTransfer?.files || [];
    if (!file) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    fileInput.files = transfer.files;
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
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
    setStatus('なおキングが写真を受け取っています…', 'is-uploading');
    let uploaded = false;
    try {
      const response = await fetch(`${endpoint}/${safeName}`, {
        method: 'POST',
        headers: { apikey: publicKey, Authorization: `Bearer ${publicKey}`, 'Content-Type': file.type, 'x-upsert': 'false' },
        body: file
      });
      if (!response.ok) throw new Error('upload failed');
      uploaded = true;
      const metadataResponse = await fetch(metadataEndpoint, {
        method: 'POST',
        headers: {
          apikey: publicKey,
          Authorization: `Bearer ${publicKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({
          object_path: safeName,
          nickname: creditInput.value.trim() || null
        })
      });
      if (!metadataResponse.ok) {
        await fetch(`${endpoint}/${safeName}`, {
          method: 'DELETE',
          headers: { apikey: publicKey, Authorization: `Bearer ${publicKey}` }
        });
        uploaded = false;
        throw new Error('metadata failed');
      }
      localStorage.setItem('naokingLastUpload', String(Date.now()));
      form.reset();
      clearPreview();
      setStatus('献上完了。なおキングが気まぐれに確認します。', 'is-success');
    } catch (error) {
      setStatus(uploaded ? '写真は届きましたが記録簿への登録に失敗しました。管理者へお知らせください。' : '送信に失敗しました。少し待ってもう一度試してください。', 'is-error');
    } finally {
      button.disabled = false;
    }
  });
})();
