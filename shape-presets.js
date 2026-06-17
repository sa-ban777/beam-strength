(() => {
  const sectionPresets = [
    { name: '断面形状_L字', type: 'L字', values: { B: 50, H: 50, t1: 6, t2: 6, diameterD: '' } },
    { name: '断面形状_コの字', type: 'コの字2', values: { B: 50, H: 50, t1: 6, t2: 6, diameterD: '' } },
    { name: '断面形状_凹の字', type: 'コの字', values: { B: 50, H: 50, t1: 6, t2: 6, diameterD: '' } },
    { name: '断面形状_I(H)形', type: 'H形鋼', values: { B: 75, H: 150, t1: 6, t2: 6, diameterD: '' } },
    { name: '断面形状_円', type: '丸棒', values: { B: '', H: '', t1: '', t2: '', diameterD: 50 } },
    { name: '断面形状_長方形', type: '長方形', values: { B: 50, H: 50, t1: '', t2: '', diameterD: '' } }
  ];

  const select = document.getElementById('shapePreset');
  const sectionType = document.getElementById('sectionType');
  if (!select || !sectionType) return;

  [...select.options].forEach(option => {
    if (option.value === '手入力' || option.textContent.trim() === '手入力') {
      option.remove();
      return;
    }
    if (!option.textContent.startsWith('型鋼_')) {
      option.textContent = '型鋼_' + option.textContent;
    }
  });

  const group = document.createElement('optgroup');
  group.label = '断面形状から選択';
  sectionPresets.forEach(preset => {
    if ([...select.options].some(o => o.value === preset.name)) return;
    const option = document.createElement('option');
    option.value = preset.name;
    option.textContent = preset.name;
    group.appendChild(option);
  });
  select.insertBefore(group, select.firstChild);

  function setDimensionValueVisibility(isSteel) {
    ['diameterD', 'B', 'H', 't1', 't2'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.toggle('dim-value-hidden', isSteel);
    });
  }

  function applySectionPreset() {
    const preset = sectionPresets.find(p => p.name === select.value);
    if (!preset) {
      setDimensionValueVisibility(true);
      return false;
    }

    sectionType.value = preset.type;
    ['B', 'H', 't1', 't2', 'diameterD'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.disabled = false;
      if (Object.prototype.hasOwnProperty.call(preset.values, id)) el.value = preset.values[id];
    });
    setDimensionValueVisibility(false);

    if (typeof render === 'function') render();
    return true;
  }

  if (select.value === '手入力') select.value = '断面形状_L字';
  select.addEventListener('change', applySectionPreset);
  applySectionPreset();
})();
