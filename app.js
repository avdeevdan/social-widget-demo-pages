/* Виджет «Соцсети» — подвал страницы и демо-окружение конструктора. */
(function () {
  'use strict';

  const dpr = () => window.devicePixelRatio || 1;
  const $ = (id) => document.getElementById(id);
  const scroller = $('pageScroll');
  const inner = $('pageInner');

  /* Шапка: режим редактирования страницы сайта */
  const header = BuilderHeader.mount($('header'), {
    title: 'Реферальная программа',
    mode: 'edit',
    history: { undo: true, redo: false, reset: true, layout: true, preview: true },
    zoom: 100,
    revision: { date: '29 сен', editing: true, image: 'assets/avatar.png' },
    onZoom: (z) => {                      // масштаб страницы: кнопки «−» и «+» в шапке
      inner.style.zoom = z / 100;
      positionSocialPopups();
    },
    onClose: () => false,                 // в демо окно не закрывается
    onSave: () => false,                  // и режим чтения не включается
  });

  /* Размеры экрана: наведение остаётся, клик по планшету и «Другим размерам» ничего не делает */
  $('header').addEventListener('click', (e) => {
    if (e.target.closest('[data-bhd-device]')) e.stopPropagation();
  }, true);

  /* Структура: секция → стеки → стеки → кнопки/текст/виджет. Рамка — обычный border на самом стеке (.stk).
     Выбран виджет «Соцсети»: у каждого стека-предка пунктир success (у ближайшего ярче), а между соседними стеками
     внутри предка — разделитель (border одного из соседей). Здесь только расставляются классы-состояния. */
  const sel = $('socialSlot');
  sel.classList.add('is-hot');
  const socialStyleToggle = $('socialStyleToggle');
  const socialStyle = $('socialStyle');
  const socialStyleToolbar = socialStyle.parentElement;
  const socialStylePreviews = $('socialStylePreviews');
  const socialStyleSwitchPresets = $('socialStyleSwitchPresets');
  const socialStyleBrandSwitch = $('socialStyleBrandSwitch');
  const socialStyleGroupedPresets = $('socialStyleGroupedPresets');
  const socialButtonPresets = $('socialButtonPresets');
  const socialAddToggle = $('socialAddToggle');
  const socialAdd = $('socialAdd');
  const constructor = $('app');
  const socialList = $('socialList');
  const socialListToggle = $('socialListToggle');
  const socialListToggleIcon = socialListToggle.querySelector('.tb__icon');
  const socialListToggleCaption = socialListToggle.querySelector('.tb__caption');
  const socialGeneralToggle = $('socialGeneralToggle');
  const socialGeneralFields = $('socialGeneralFields');
  const socialItemStyle = $('socialItemStyle');
  const socialItemStyleIcon = socialItemStyle.querySelector('.btn__icon');
  const socialItemStyleLabel = socialItemStyle.querySelector('.btn__caption');
  const socialAppearance = $('socialAppearance');
  const socialAppearanceToggle = $('socialAppearanceToggle');
  const socialColor = $('socialColor');
  const socialColorToggle = $('socialColorToggle');
  const socialToolbarColorToggle = $('socialToolbarColorToggle');
  const socialColorModeToggle = $('socialColorModeToggle');
  const socialColorModes = $('socialColorModes');
  const socialColorForm = $('socialColorForm');
  const socialListRows = $('socialListRows');
  const socialListManual = $('socialListManual');
  const socialListContext = $('socialListContext');
  const socialListContextPicker = $('socialListContextPicker');
  const socialListClearContext = $('socialListClearContext');
  const socialListAdd = socialList.querySelector('.social-list__add');
  const demoContext = 'Контрагент.Контакты';
  const socialSize = $('socialSize');
  const socialSizeToggle = $('socialSizeToggle');
  const socialItemSizeToggle = $('socialItemSizeToggle');
  const socialSizeForm = $('socialSizeForm');
  const socialListBody = $('socialListBody');
  const socialDetail = $('socialDetail');
  const socialDetailName = $('socialDetailName');
  const socialDetailLink = $('socialDetailLink');
  const socialDetailTab = $('socialDetailTab');
  const socialDetailPage = $('socialDetailPage');
  const socialListBack = socialList.querySelector('.pe__back');
  const socialListReset = socialList.querySelector('.pe__reset');
  const socialItems = sel.querySelector('.social-items');
  constructor.append(socialList, socialAdd, socialSize, socialColor, socialColorModes);
  let listDraft = [];
  let removedItem = null;
  let draftRemovedItem = null;
  let savedWidgetItems = null;
  let detailEntry = null;
  let detailTrigger = null;
  let activeListTrigger = socialListToggle;
  let pinnedListPosition = null;
  let draggedListEntry = null;
  let activeSizeTrigger = socialSizeToggle;
  let activeColorTrigger = socialColorToggle;
  let activeStyleTrigger = socialStyleToggle;
  let previousButtonStyle = null;
  let socialAddTrigger = socialAddToggle;
  const itemSizes = ['m', 'xl', '5xl'];
  let itemSize = 'xl';
  let draftItemSize = itemSize;
  const itemLayouts = new Map();
  let draftItemLayouts = null;
  let draftStyle = null;
  let itemColor = null;
  let draftItemColor = itemColor;
  let itemColorMode = 'custom';
  let draftItemColorMode = itemColorMode;
  let itemScenario = 'always-visible';
  updateSocialListToggle(sel.dataset.context ?? demoContext);
  let appearanceScenario = 'mixed';
  const socialAddExtra = $('socialAddExtra');
  const socialAddMore = socialAdd.querySelector('.social-add__more');
  const socialPresets = [
    { label: 'Иконки в акцентном цвете', shortLabel: 'Ссылка', classes: 'btn--link' },
    { label: 'Иконки в цветах соцсетей', shortLabel: 'Ссылка · бренд', classes: 'btn--link social-button--brand' },
    { label: 'Круглые с акцентной заливкой', shortLabel: 'Круглая', classes: 'btn--filled social-button--round' },
    { label: 'Круглые с заливкой в цветах соцсетей', shortLabel: 'Круглая · бренд', classes: 'btn--filled social-button--round social-button--brand' },
    { label: 'Скруглённые с акцентным контуром', shortLabel: 'Контурная', classes: 'btn--outlined social-button--rounded' },
    { label: 'Скруглённые квадратные в цветах соцсетей', shortLabel: 'Скруглённая · бренд', classes: 'btn--outlined social-button--rounded social-button--tinted social-button--brand' },
  ];
  const styleClasses = (option) => option.dataset.styleClasses
    ? option.dataset.styleClasses.split(' ')
    : [...option.firstElementChild.classList].filter((name) => name !== 'btn' && !name.startsWith('btn--size-'));
  const selectedStyle = () => socialStyle.querySelector(':scope > :not([hidden]) .social-style__option[aria-pressed="true"]');
  function addStyleOptions(group, presets, layout) {
    for (const { label, shortLabel = label, classes } of presets) {
      const option = document.createElement('button');
      option.type = 'button';
      option.classList.add('social-style__option', layout);
      option.dataset.styleClasses = classes;
      option.dataset.shortLabel = shortLabel;
      option.title = label;
      option.setAttribute('aria-label', label);
      option.setAttribute('aria-pressed', 'false');
      group.append(option);
    }
  }

  const shapePresets = [
    { label: 'Кнопка-ссылка', shortLabel: 'Ссылка', classes: 'btn--link' },
    { label: 'Контурная круглая', classes: 'btn--outlined social-button--round' },
    { label: 'Контурная квадратная со скруглением', classes: 'btn--outlined social-button--rounded' },
    { label: 'Залитая круглая', classes: 'btn--filled social-button--round' },
    { label: 'Залитая квадратная со скруглением', classes: 'btn--filled social-button--rounded' },
  ];
  addStyleOptions(socialStylePreviews, socialPresets, 'social-style__preview-row');
  markSocialStyle(socialStylePreviews, socialStylePreviews.firstElementChild);
  const switchButtonPresets = [1, 3, 2, 4].map((index) => shapePresets[index]);
  addStyleOptions($('socialStyleSwitchButtons'), switchButtonPresets, 'social-style__tile');
  addStyleOptions($('socialStyleSwitchLinks'), [shapePresets[0]], 'social-style__tile');
  const groupedPresets = [shapePresets[0], shapePresets[1], shapePresets[3],
    { label: 'Квадратная со скруглением', classes: 'btn--square' }];
  addStyleOptions($('socialStyleCustomGroup'), groupedPresets, 'social-style__tile');
  addStyleOptions($('socialStyleBrandGroup'), groupedPresets.map((preset) => ({
    ...preset, classes: preset.classes + ' social-button--brand',
  })), 'social-style__tile');
  let appliedStyle = selectedStyle();
  let displayedStyle = appliedStyle;

  function renderSocialStylePreviews(group, branded = false) {
    const items = Array.from(socialItems.children).filter((item) => !item.hidden).slice(0, 3);
    for (const option of group.querySelectorAll('.social-style__option')) {
      if (!items.length) {
        option.textContent = option.title;
        continue;
      }
      const samples = items.map((item) => {
        const sample = document.createElement('span');
        sample.classList.add('btn', 'btn--size-xl', 'btn--icon', 'social-style__sample', ...styleClasses(option));
        if (branded) sample.classList.add('social-button--brand');
        sample.dataset.network = item.dataset.network;
        sample.setAttribute('aria-hidden', 'true');
        sample.append(item.querySelector('.btn__icon').cloneNode(true));
        return sample;
      });
      option.replaceChildren(...samples);
    }
  }

  function renderWidgetStyle(option) {
    const nextClasses = styleClasses(option);
    const previousClasses = styleClasses(displayedStyle);
    const items = new Set([...socialItems.children, ...listDraft.map(({ button }) => button)]);
    if (removedItem) items.add(removedItem.entry.button);
    if (draftRemovedItem) items.add(draftRemovedItem.entry.button);
    for (const item of items) {
      item.classList.remove(...previousClasses);
      item.classList.add(...nextClasses);
      item.classList.toggle('social-button--brand', sel.dataset.colorMode === 'brand');
      applyItemPresentation(item, option);
    }
    displayedStyle = option;
    socialToolbarColorToggle.hidden = sel.dataset.colorMode === 'brand';
  }

  function applySocialStyle(option) {
    renderWidgetStyle(option);
    appliedStyle = option;
  }

  function showStyleMenu(group) {
    for (const menu of [socialStylePreviews, socialStyleSwitchPresets, socialStyleGroupedPresets, socialButtonPresets]) {
      menu.hidden = menu !== group;
    }
    socialStyle.classList.toggle('social-style--networks', group === socialStylePreviews);
    socialStyle.classList.toggle('social-style--switch', group === socialStyleSwitchPresets);
    socialStyle.classList.toggle('social-style--grouped', group === socialStyleGroupedPresets);
  }

  function matchStyleOption(group, style, brand = styleClasses(style).includes('social-button--brand')) {
    const classes = styleClasses(style).filter((name) => name !== 'social-button--brand');
    if (brand && group !== socialButtonPresets && group !== socialStyleSwitchPresets) classes.push('social-button--brand');
    return [...group.querySelectorAll('.social-style__option')].find((option) =>
      styleClasses(option).join(' ') === classes.join(' '));
  }

  function markSocialStyle(group, option) {
    group.querySelector('.social-style__option[aria-pressed="true"]')?.setAttribute('aria-pressed', 'false');
    option?.setAttribute('aria-pressed', 'true');
  }

  function selectSocialStyle(option) {
    for (const group of [socialStylePreviews, socialButtonPresets]) {
      const equivalent = matchStyleOption(group, option, itemColorMode === 'brand');
      if (equivalent) markSocialStyle(group, equivalent);
    }
    applySocialStyle(option);
  }

  function selectToolbarStyle(option) {
    const branded = socialStyleSwitchPresets.contains(option)
      ? socialStyleBrandSwitch.checked
      : styleClasses(option).includes('social-button--brand');
    itemColorMode = branded ? 'brand' : 'custom';
    sel.dataset.colorMode = itemColorMode;
    selectSocialStyle(option);
  }

  function renderToolbarStyleMenu() {
    if (appearanceScenario === 'brand-switch') {
      showStyleMenu(socialStyleSwitchPresets);
      renderSocialStylePreviews(socialStyleSwitchPresets, socialStyleBrandSwitch.checked);
      markSocialStyle(socialStyleSwitchPresets, matchStyleOption(socialStyleSwitchPresets, appliedStyle));
    } else if (appearanceScenario === 'grouped') {
      showStyleMenu(socialStyleGroupedPresets);
      renderSocialStylePreviews(socialStyleGroupedPresets);
      markSocialStyle(socialStyleGroupedPresets, matchStyleOption(socialStyleGroupedPresets, appliedStyle, itemColorMode === 'brand'));
    } else {
      showStyleMenu(socialStylePreviews);
      renderSocialStylePreviews(socialStylePreviews);
      markSocialStyle(socialStylePreviews, matchStyleOption(socialStylePreviews, appliedStyle, itemColorMode === 'brand'));
    }
  }

  socialStyleBrandSwitch.addEventListener('change', () => {
    renderSocialStylePreviews(socialStyleSwitchPresets, socialStyleBrandSwitch.checked);
  });

  function itemLayoutKey(option) {
    return styleClasses(option).filter((name) => name !== 'social-button--brand').join(' ');
  }

  function applyItemPresentation(item, option = displayedStyle) {
    item.classList.remove(...itemSizes.map((size) => 'btn--size-' + size));
    item.classList.add('btn--size-' + (draftItemLayouts ? draftItemSize : itemSize));
    const layout = (draftItemLayouts ?? itemLayouts).get(itemLayoutKey(option));
    for (const property of itemLayoutProperties) item.style[property] = layout?.[property] ?? '';
  }

  function positionSocialStyle() {
    if (socialStyle.hidden) return;
    const popup = socialStyle;
    popup.classList.remove('is-above');
    const panel = popup.getBoundingClientRect();
    if (activeStyleTrigger === socialItemStyle) {
      const anchor = socialItemStyle.getBoundingClientRect();
      const first = popup.querySelector(':scope > :not([hidden]) .social-style__option');
      const sample = (first.firstElementChild ?? first).getBoundingClientRect();
      const left = anchor.left + (anchor.width - sample.width) / 2 - (sample.left - panel.left);
      const top = anchor.top + (anchor.height - sample.height) / 2 - (sample.top - panel.top);
      popup.style.left = window.scrollX + left + 'px';
      popup.style.top = window.scrollY + top + 'px';
      return;
    }
    const toolbar = popup.parentElement.getBoundingClientRect();
    const anchor = socialStyleToggle.getBoundingClientRect();
    const scale = toolbar.width / popup.parentElement.offsetWidth || 1;
    popup.style.left = (anchor.left + anchor.width / 2 - toolbar.left) / scale - popup.offsetWidth / 2 + 'px';
    const page = scroller.getBoundingClientRect();
    const spaceAbove = toolbar.top - page.top;
    const spaceBelow = page.bottom - toolbar.bottom;
    const above = panel.bottom > page.bottom && spaceAbove > spaceBelow;
    popup.classList.toggle('is-above', above);
  }

  function positionConstructorPopup(popup, trigger) {
    if (popup.hidden) return;
    const bounds = constructor.getBoundingClientRect();
    const gap = 8;
    if (popup === socialAdd && trigger !== socialAddToggle) {
      const plus = trigger.querySelector('.btn__icon').getBoundingClientRect();
      const heading = $('socialAddTitle');
      const title = heading.getBoundingClientRect();
      const panel = popup.getBoundingClientRect();
      const titleInset = title.left - panel.left + parseFloat(getComputedStyle(heading).paddingLeft);
      const titleCenter = title.top - panel.top + title.height / 2;
      const left = Math.min(plus.left - bounds.left - titleInset, constructor.clientWidth - popup.offsetWidth - gap);
      const top = Math.min(plus.top + plus.height / 2 - bounds.top - titleCenter, constructor.clientHeight - popup.offsetHeight - gap);
      popup.style.left = Math.max(gap, left) + 'px';
      popup.style.top = Math.max(gap, top) + 'px';
      return;
    }
    const toolbar = trigger.closest('.wg__toolbar').getBoundingClientRect();
    if (popup === socialList) {
      if (pinnedListPosition) {
        const { left, top } = pinnedListPosition;
        popup.style.left = left + 'px';
        popup.style.top = top + 'px';
        const headerHeight = popup.querySelector('.pe__head').offsetHeight;
        popup.style.setProperty('--social-list-body-height', Math.max(0, constructor.clientHeight - top - headerHeight - gap) + 'px');
        return;
      }
      const widget = sel.getBoundingClientRect();
      const left = widget.left - bounds.left - popup.offsetWidth - 6;
      const top = Math.min(toolbar.top - bounds.top - 2, constructor.clientHeight - popup.offsetHeight - gap);
      popup.style.left = Math.max(gap, left) + 'px';
      popup.style.top = Math.max(gap, top) + 'px';
      return;
    }
    const below = toolbar.bottom - bounds.top + gap;
    const above = toolbar.top - bounds.top - gap - popup.offsetHeight;
    const top = below + popup.offsetHeight <= constructor.clientHeight - gap ? below : above;
    popup.style.top = Math.max(gap, top) + 'px';
    const left = Math.min(toolbar.left - 6 - bounds.left, constructor.clientWidth - popup.offsetWidth - gap);
    popup.style.left = Math.max(gap, left) + 'px';
  }

  function positionSocialPopups() {
    positionConstructorPopup(socialList, activeListTrigger);
    positionSocialStyle();
    positionConstructorPopup(socialAdd, socialAddTrigger);
    positionSocialSize();
    positionSocialColor();
    positionColorModes();
  }

  function setPopupTrigger(trigger, open) {
    trigger.setAttribute('aria-expanded', String(open));
    if (trigger.classList.contains('tb__btn')) trigger.classList.toggle('is-selected', open);
  }

  function positionSocialSize() {
    if (socialSize.hidden) return;
    const bounds = constructor.getBoundingClientRect();
    if (activeSizeTrigger === socialItemSizeToggle) {
      const panel = socialList.getBoundingClientRect();
      const top = panel.top - bounds.top;
      const available = constructor.clientHeight - top - socialSize.querySelector('.pe__head').offsetHeight - 8;
      socialSize.style.left = panel.left - bounds.left + 'px';
      socialSize.style.top = top + 'px';
      socialSize.style.setProperty('--social-size-body-height', Math.max(0, available) + 'px');
      return;
    }
    const anchor = socialSizeToggle.getBoundingClientRect();
    socialSize.style.left = anchor.left - bounds.left + 'px';
    socialSize.style.top = anchor.top - bounds.top - socialSize.offsetHeight - 4 + 'px';
  }

  const spacingProperties = {
    paddingInline: ['paddingLeft', 'paddingRight'],
    paddingBlock: ['paddingTop', 'paddingBottom'],
    marginInline: ['marginLeft', 'marginRight'],
    marginBlock: ['marginTop', 'marginBottom'],
  };
  const itemLayoutProperties = ['width', 'height', ...Object.values(spacingProperties).flat()];
  const sizeFields = socialSizeForm.elements;
  const sizeReset = socialSize.querySelector('.pe__reset');
  const spacingToggles = Array.from(socialSizeForm.querySelectorAll('[data-spacing]'));
  let initialSize = new Map();

  function readSpacingPair(value) {
    const [first, ...rest] = value.trim().split(/\s*\/\s*/);
    return [first, rest.length ? rest.join(' / ') : first];
  }

  function writeSpacingPair(field, first, second) {
    sizeFields[field].value = first === second ? first : first + ' / ' + second;
  }

  for (const toggle of spacingToggles) {
    toggle.addEventListener('click', () => {
      const group = toggle.dataset.spacing;
      const sides = $(toggle.getAttribute('aria-controls'));
      const expanded = sides.hidden;
      for (const axis of ['Inline', 'Block']) {
        const field = group + axis;
        const [start, end] = spacingProperties[field].map((name) => sizeFields[name]);
        if (expanded) [start.value, end.value] = readSpacingPair(sizeFields[field].value);
        else writeSpacingPair(field, start.value, end.value);
        [start, end, sizeFields[field]].forEach((input) => input.setCustomValidity(''));
      }
      sides.hidden = !expanded;
      sides.previousElementSibling.hidden = expanded;
      toggle.setAttribute('aria-expanded', String(expanded));
      positionSocialSize();
    });
  }

  function resetSocialSize() {
    const itemSettings = activeSizeTrigger === socialItemSizeToggle;
    const target = itemSettings ? socialItems.querySelector('.social-item:not([hidden])') : sel;
    const computed = target ? getComputedStyle(target) : null;
    const modes = { m: 24, xl: 32, '5xl': 48 };
    const layout = itemSettings ? draftItemLayouts.get(itemLayoutKey(draftStyle)) : null;
    sizeFields.width.value = target?.offsetWidth ?? (parseFloat(layout?.width) || modes[draftItemSize]);
    sizeFields.height.value = target?.offsetHeight ?? (parseFloat(layout?.height) || modes[draftItemSize]);
    for (const axis of ['width', 'height']) {
      const fixed = Boolean(target?.style[axis] || layout?.[axis]);
      sizeFields[axis + 'Mode'].value = fixed ? 'px' : 'auto';
      sizeFields[axis].closest('.pe__dim').classList.toggle('pe__dim--auto', !fixed);
    }
    for (const [field, [start, end]] of Object.entries(spacingProperties)) {
      const first = String(parseFloat(computed?.[start] ?? layout?.[start]) || 0);
      const second = String(parseFloat(computed?.[end] ?? layout?.[end]) || 0);
      sizeFields[start].value = first;
      sizeFields[end].value = second;
      writeSpacingPair(field, first, second);
      [start, end, field].forEach((name) => sizeFields[name].setCustomValidity(''));
    }
    sizeFields.hideEmpty.checked = sel.dataset.hideEmpty === 'true';
    sizeFields.hideEmpty.closest('.pe__card').hidden = itemSettings;
    initialSize = new Map(new FormData(socialSizeForm));
    sizeReset.disabled = true;
  }

  function closeSocialSize(restoreFocus) {
    if (socialSize.hidden) return;
    socialSize.hidden = true;
    setPopupTrigger(activeSizeTrigger, false);
    socialList.style.visibility = '';
    if (restoreFocus) activeSizeTrigger.focus({ preventScroll: true });
    activeSizeTrigger = socialSizeToggle;
  }

  function openSocialSize({ currentTarget: trigger }) {
    if (!socialSize.hidden && trigger === activeSizeTrigger) {
      closeSocialSize(true);
      return;
    }
    closeSocialSize(false);
    closeSocialStyle(false);
    closeSocialAdd(false);
    closeSocialColor();
    const drilledIn = trigger === socialItemSizeToggle;
    if (drilledIn) socialList.style.visibility = 'hidden';
    else closeSocialList(false);
    activeSizeTrigger = trigger;
    resetSocialSize();
    socialSize.classList.toggle('is-drilled-in', drilledIn);
    socialSize.hidden = false;
    setPopupTrigger(trigger, true);
    positionSocialSize();
    sizeFields.width.focus({ preventScroll: true });
  }
  socialSizeToggle.addEventListener('click', openSocialSize);
  socialItemSizeToggle.addEventListener('click', openSocialSize);
  socialSize.querySelector('.pe__back').addEventListener('click', () => {
    if (activeSizeTrigger === socialItemSizeToggle) {
      closeSocialSize(true);
      return;
    }
    const left = parseFloat(socialSize.style.left);
    const top = parseFloat(socialSize.style.top);
    openSocialList({ currentTarget: socialGeneralToggle }, { left, top });
  });
  socialSize.querySelector('.pe__close').addEventListener('click', () => closeSocialSize(true));
  sizeReset.addEventListener('click', resetSocialSize);
  socialSizeForm.addEventListener('input', ({ target }) => {
    target.setCustomValidity('');
    if (target.name === 'width' || target.name === 'height') sizeFields[target.name + 'Mode'].value = 'px';
    for (const axis of ['width', 'height']) {
      sizeFields[axis].closest('.pe__dim').classList.toggle('pe__dim--auto', sizeFields[axis + 'Mode'].value === 'auto');
    }
    sizeReset.disabled = false;
  });
  socialSizeForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const spacing = [];
    for (const [field, properties] of Object.entries(spacingProperties)) {
      const group = field.startsWith('padding') ? 'padding' : 'margin';
      const expanded = spacingToggles.find((toggle) => toggle.dataset.spacing === group).getAttribute('aria-expanded') === 'true';
      const inputs = expanded ? properties.map((name) => sizeFields[name]) : [sizeFields[field]];
      const parts = expanded ? inputs.map((input) => input.value.trim()) : readSpacingPair(inputs[0].value);
      if (parts.every((part, index) => part === initialSize.get(properties[index]))) continue;
      const values = parts.map(Number);
      const invalid = values.findIndex((value, index) => !parts[index] || !Number.isFinite(value) || (group === 'padding' && value < 0));
      if (invalid !== -1) {
        const input = expanded ? inputs[invalid] : inputs[0];
        input.setCustomValidity(expanded ? 'Введите число.' : 'Введите одно число или два числа через «/».');
        input.reportValidity();
        return;
      }
      spacing.push([properties, values]);
    }
    const key = activeSizeTrigger === socialItemSizeToggle ? itemLayoutKey(draftStyle) : null;
    const layout = key ? { ...draftItemLayouts.get(key) } : sel.style;
    for (const [properties, [first, second = first]] of spacing) {
      layout[properties[0]] = first + 'px';
      layout[properties[1]] = second + 'px';
    }
    for (const axis of ['width', 'height']) {
      const mode = sizeFields[axis + 'Mode'].value;
      if (mode !== initialSize.get(axis + 'Mode') || sizeFields[axis].value !== initialSize.get(axis)) {
        layout[axis] = mode === 'auto' ? '' : sizeFields[axis].value + 'px';
      }
    }
    if (key) {
      draftItemLayouts.set(key, layout);
      renderWidgetStyle(draftStyle);
    } else sel.dataset.hideEmpty = String(sizeFields.hideEmpty.checked);
    closeSocialSize(true);
    toBottom();
  });

  const colorFields = socialColorForm.elements;
  const colorReset = socialColor.querySelector('.pe__reset');
  const defaultSocialColor = getComputedStyle(sel).getPropertyValue('--page-accent').trim();
  const colorPresets = ['#656c87', '#000000', '#999999', '#8991a9', '#2562aa', '#5a49ab', '#cc3d00', '#c2140a', '#298e3c'];

  function socialColorValue(color) {
    if (!color) return '';
    if (color.opacity === 100) return color.hex;
    return `color-mix(in srgb, ${color.hex} ${color.opacity}%, transparent)`;
  }

  function renderSocialColor(element, color) {
    element.style.setProperty('--social-color-preview', socialColorValue(color));
  }

  function renderItemColor(color) {
    const value = socialColorValue(color);
    for (const element of [sel, socialItemStyle, socialStyle]) {
      element.style.setProperty('--social-item-color', value);
    }
    renderSocialColor(socialToolbarColorToggle, color);
  }

  function renderItemColorMode(mode) {
    sel.dataset.colorMode = mode;
    renderWidgetStyle(displayedStyle);
  }

  function updateColorModeControls() {
    const branded = draftItemColorMode === 'brand';
    socialColorToggle.hidden = branded;
    socialColorModeToggle.querySelector('.btn__caption').textContent = branded ? 'Брендированный' : 'Свой';
    socialItemStyle.classList.toggle('social-button--brand', branded);
    for (const option of socialColorModes.querySelectorAll('[data-color-mode]')) {
      const selected = option.dataset.colorMode === draftItemColorMode;
      option.classList.toggle('is-selected', selected);
      option.setAttribute('aria-pressed', String(selected));
    }
  }

  function closeColorModes(restoreFocus) {
    if (socialColorModes.hidden) return;
    socialColorModes.hidden = true;
    setPopupTrigger(socialColorModeToggle, false);
    if (restoreFocus) socialColorModeToggle.focus({ preventScroll: true });
  }

  function positionColorModes() {
    if (socialColorModes.hidden) return;
    const bounds = constructor.getBoundingClientRect();
    const menu = socialColorModes.getBoundingClientRect();
    const anchor = socialColorModeToggle.querySelector('.btn__caption').getBoundingClientRect();
    const current = socialColorModes.querySelector('.is-selected .social-color-mode__value').getBoundingClientRect();
    socialColorModes.style.left = anchor.left - bounds.left - (current.left - menu.left) + 'px';
    socialColorModes.style.top = anchor.top + (anchor.height - current.height) / 2 - bounds.top - (current.top - menu.top) + 'px';
  }

  socialColorModeToggle.addEventListener('click', () => {
    if (!socialColorModes.hidden) {
      closeColorModes(true);
      return;
    }
    closeSocialColor();
    closeSocialStyle(false);
    socialColorModes.hidden = false;
    positionColorModes();
    setPopupTrigger(socialColorModeToggle, true);
    socialColorModes.querySelector('.is-selected').focus({ preventScroll: true });
  });
  $('socialColorModesClose').addEventListener('click', () => closeColorModes(true));
  socialListBody.addEventListener('scroll', positionColorModes);
  socialColorModes.addEventListener('click', (event) => {
    const option = event.target.closest('button[data-color-mode]');
    if (!option) return;
    draftItemColorMode = option.dataset.colorMode;
    renderItemColorMode(draftItemColorMode);
    updateColorModeControls();
    closeColorModes(true);
  });

  function positionSocialColor() {
    if (socialColor.hidden) return;
    const bounds = constructor.getBoundingClientRect();
    const anchor = activeColorTrigger.getBoundingClientRect();
    const left = Math.min(anchor.left - bounds.left, constructor.clientWidth - socialColor.offsetWidth - 8);
    const top = activeColorTrigger === socialToolbarColorToggle
      ? anchor.top - bounds.top - socialColor.offsetHeight - 4
      : Math.min(anchor.bottom - bounds.top + 4, constructor.clientHeight - socialColor.offsetHeight - 8);
    socialColor.style.left = Math.max(8, left) + 'px';
    socialColor.style.top = Math.max(8, top) + 'px';
  }

  function closeSocialColor(restoreFocus) {
    if (socialColor.hidden) return;
    socialColor.hidden = true;
    setPopupTrigger(activeColorTrigger, false);
    if (restoreFocus) activeColorTrigger.focus({ preventScroll: true });
    activeColorTrigger = socialColorToggle;
  }

  function updateSocialColorFields(color) {
    colorFields.hex.value = color.hex.toUpperCase();
    colorFields.opacity.value = color.opacity;
    previewSocialColorFields();
  }

  function readSocialColorFields() {
    const hex = '#' + colorFields.hex.value.trim().replace(/^#/, '').toLowerCase();
    const opacity = colorFields.opacity.valueAsNumber;
    if (!/^#[0-9a-f]{6}$/.test(hex) || !colorFields.opacity.validity.valid) return null;
    return { hex, opacity };
  }

  function previewSocialColorFields() {
    const color = readSocialColorFields();
    colorFields.hex.setCustomValidity('');
    if (!color) return;
    renderSocialColor(socialColor, color);
    colorReset.disabled = color.hex === defaultSocialColor && color.opacity === 100;
  }

  function applySocialColor(color) {
    if (activeColorTrigger === socialToolbarColorToggle) itemColor = color;
    else draftItemColor = color;
    renderSocialColor(socialColorToggle, color);
    renderItemColor(color);
    closeSocialColor(true);
  }

  function renderColorPresets(activeColor) {
    const colors = [activeColor, ...colorPresets.filter((hex) => hex !== activeColor.hex)
      .map((hex) => ({ hex, opacity: 100 }))];
    $('socialColorPalette').replaceChildren(...colors.map((color, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'pe__pal';
      button.setAttribute('aria-label', index === 0 ? 'Текущий цвет ' + color.hex : color.hex);
      button.style.setProperty('--pe-color', socialColorValue(color));
      button.addEventListener('click', () => {
        const opacity = index === 0 ? color.opacity : readSocialColorFields()?.opacity ?? 100;
        applySocialColor({ hex: color.hex, opacity });
      });
      return button;
    }));
  }

  function openSocialColor({ currentTarget: trigger }) {
    closeColorModes(false);
    if (!socialColor.hidden && activeColorTrigger === trigger) {
      closeSocialColor(true);
      return;
    }
    closeSocialColor(false);
    closeSocialStyle(false);
    closeSocialAdd(false);
    closeSocialSize(false);
    const fromToolbar = trigger === socialToolbarColorToggle;
    if (fromToolbar) closeSocialList(false);
    activeColorTrigger = trigger;
    const activeColor = (fromToolbar ? itemColor : draftItemColor) ?? { hex: defaultSocialColor, opacity: 100 };
    updateSocialColorFields(activeColor);
    renderColorPresets(activeColor);
    socialColor.hidden = false;
    positionSocialColor();
    setPopupTrigger(trigger, true);
    colorFields.hex.focus({ preventScroll: true });
  }
  socialToolbarColorToggle.addEventListener('click', openSocialColor);
  socialColorToggle.addEventListener('click', openSocialColor);
  socialColor.querySelector('.pe__close').addEventListener('click', () => closeSocialColor(true));
  colorReset.addEventListener('click', () => updateSocialColorFields({ hex: defaultSocialColor, opacity: 100 }));
  $('socialColorOther').addEventListener('click', () => {
    const nativeColor = colorFields.nativeColor;
    nativeColor.value = readSocialColorFields()?.hex ?? defaultSocialColor;
    if (nativeColor.showPicker) nativeColor.showPicker();
    else nativeColor.click();
  });
  socialColorForm.addEventListener('input', ({ target }) => {
    if (target === colorFields.nativeColor) colorFields.hex.value = target.value.toUpperCase();
    previewSocialColorFields();
  });
  socialColorForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const color = readSocialColorFields();
    if (!color) {
      colorFields.hex.setCustomValidity('Введите HEX-код из шести символов.');
      colorFields.hex.reportValidity();
      return;
    }
    const isDefault = color.hex === defaultSocialColor && color.opacity === 100;
    applySocialColor(isDefault ? null : color);
  });

  function closeSocialAdd(restoreFocus) {
    socialAdd.hidden = true;
    setPopupTrigger(socialAddTrigger, false);
    if (restoreFocus) socialAddTrigger.focus({ preventScroll: true });
  }

  function openSocialAdd(event) {
    if (!socialAdd.hidden) {
      closeSocialAdd(true);
      return;
    }
    closeSocialStyle(false);
    closeSocialSize(false);
    socialAddTrigger = event.currentTarget;
    socialAdd.hidden = false;
    setPopupTrigger(socialAddTrigger, true);
    positionConstructorPopup(socialAdd, socialAddTrigger);
    socialAdd.querySelector('.social-add__item').focus({ preventScroll: true });
  }
  socialAddToggle.addEventListener('click', openSocialAdd);
  socialAdd.querySelector('.social-add__close').addEventListener('click', () => closeSocialAdd(true));
  socialAddMore.addEventListener('click', () => {
    const expanded = socialAddExtra.hidden;
    socialAddExtra.hidden = !expanded;
    socialAddMore.setAttribute('aria-expanded', String(expanded));
    socialAddMore.setAttribute('aria-label', expanded ? 'Скрыть дополнительные соцсети' : 'Показать ещё соцсети');
    socialAddMore.firstElementChild.hidden = expanded;
    socialAddMore.lastElementChild.hidden = !expanded;
    positionConstructorPopup(socialAdd, socialAddTrigger);
    if (expanded) socialAddExtra.querySelector('.social-add__item').focus({ preventScroll: true });
  });

  socialAdd.addEventListener('click', (event) => {
    const option = event.target.closest('[data-network]');
    if (!option) return;
    const label = option.lastElementChild.textContent;
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('btn', 'btn--size-xl', 'social-item', ...styleClasses(displayedStyle));
    button.classList.toggle('social-button--brand', sel.dataset.colorMode === 'brand');
    button.setAttribute('aria-label', label);
    button.dataset.network = option.dataset.network;
    button.dataset.manual = 'true';

    const icon = document.createElement('span');
    icon.className = 'btn__icon';
    icon.setAttribute('aria-hidden', 'true');
    const path = 'assets/iconsSocial/' + option.dataset.network + '.svg';
    if (location.protocol === 'file:') {
      const image = document.createElement('img');
      image.src = path;
      image.alt = '';
      icon.append(image);
    } else {
      icon.classList.add('social-item__mask');
      icon.style.setProperty('--social-icon', 'url("' + path + '")');
    }
    const caption = document.createElement('span');
    caption.className = 'btn__caption';
    caption.hidden = true;
    caption.textContent = label;
    button.append(icon, caption);
    applyItemPresentation(button);
    if (!socialList.hidden) {
      const bound = Boolean(socialListContext.value);
      const entry = { button, value: '', hidden: false, manual: true };
      listDraft.push(entry);
      renderSocialList();
      closeSocialAdd(!bound);
      if (bound) {
        const row = socialListRows.lastElementChild;
        openSocialDetail(entry, row.querySelector('img'), row.querySelector('.social-list__open'));
      }
    } else {
      socialItems.append(button);
      toBottom();
      closeSocialAdd(true);
    }
  });

  function resetSocialList() {
    restoreWidgetItems();
    draftRemovedItem = removedItem;
    listDraft = Array.from(socialItems.children, (button) => ({
      button, value: button.dataset.link || '', hidden: button.hidden,
      newTab: button.dataset.newTab === 'true',
      name: button.dataset.name, manual: button.dataset.manual === 'true',
    }));
    setSocialListContext(sel.dataset.context ?? demoContext, true);
  }

  function restoreWidgetItems() {
    if (!savedWidgetItems) return;
    const current = [...socialItems.children];
    if (current.length !== savedWidgetItems.length || current.some((button, index) => button !== savedWidgetItems[index])) {
      socialItems.replaceChildren(...savedWidgetItems);
    }
  }

  function removeListItem(entry) {
    if (draftRemovedItem) return;
    const index = listDraft.indexOf(entry);
    draftRemovedItem = { entry, index };
    listDraft.splice(index, 1);
    entry.button.remove();
    renderSocialList();
    socialListAdd.focus({ preventScroll: true });
  }

  function addListItem(event) {
    if (!draftRemovedItem || socialListContext.value) {
      openSocialAdd(event);
      return;
    }
    const { entry, index } = draftRemovedItem;
    draftRemovedItem = null;
    listDraft.splice(index, 0, entry);
    if (savedWidgetItems.includes(entry.button) || removedItem?.entry.button === entry.button) {
      const originalIndex = savedWidgetItems.indexOf(entry.button);
      const next = originalIndex >= 0 ? savedWidgetItems[originalIndex + 1] : socialItems.children[index];
      socialItems.insertBefore(entry.button, next ?? null);
      applyItemPresentation(entry.button);
    }
    renderSocialList();
  }

  function setSocialListContext(value, reposition = false) {
    draggedListEntry = null;
    const bound = Boolean(value);
    socialListContext.value = value;
    socialListContext.disabled = bound;
    socialListContextPicker.disabled = bound;
    socialListClearContext.hidden = !bound;
    updateSocialListToggle(value);
    renderSocialList(reposition);
  }

  function updateSocialListToggle(value) {
    socialListToggleIcon.textContent = value ? '\uEA6E' : '\uE708';
    socialListToggleIcon.classList.toggle('social-context-icon', Boolean(value));
    socialListToggleCaption.textContent = value.split('.').at(-1).trim() || 'Соцсети';
    socialAddToggle.hidden = Boolean(value) && itemScenario !== 'always-add';
  }

  function selectSocialListContext() {
    setSocialListContext(demoContext);
  }

  socialListContext.addEventListener('click', selectSocialListContext);
  socialListContext.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    selectSocialListContext();
  });
  socialListContextPicker.addEventListener('click', selectSocialListContext);
  socialListClearContext.addEventListener('click', () => {
    setSocialListContext('', true);
    socialListContext.focus({ preventScroll: true });
  });

  function renderSocialList(reposition = true) {
    const bound = Boolean(socialListContext.value);
    const allowContextAdd = bound && itemScenario === 'always-add';
    socialListManual.hidden = bound && itemScenario === 'hide-with-context';
    socialListAdd.hidden = bound && !allowContextAdd;
    socialListAdd.setAttribute('aria-haspopup', draftRemovedItem && !bound ? 'false' : 'dialog');
    socialListRows.replaceChildren();
    listDraft.forEach((entry) => {
      const readonly = bound && !(entry.manual && allowContextAdd);
      const label = entry.name || entry.button.getAttribute('aria-label');
      const network = entry.button.dataset.network;
      const row = document.createElement('div');
      row.className = 'social-list__row';
      row.classList.toggle('is-readonly', readonly);
      row.classList.toggle('is-disabled', entry.hidden);
      const icon = document.createElement('img');
      const listIcon = ['vkontakte', 'ok', 'telegram'].includes(network);
      icon.src = (listIcon ? 'assets/social-list/' : 'assets/iconsSocial/') + network + '.svg';
      icon.alt = '';
      icon.draggable = false;
      const iconSlot = document.createElement('span');
      iconSlot.className = 'social-list__icon';
      iconSlot.append(icon);
      const name = document.createElement('span');
      name.className = 'social-list__name';
      name.textContent = label;
      const link = document.createElement('span');
      link.className = 'social-list__link';
      link.textContent = entry.value;
      const open = document.createElement(readonly ? 'div' : 'button');
      open.className = 'social-list__open';
      open.append(iconSlot, name, link);
      row.append(open);
      socialListRows.append(row);
      if (readonly) return;
      open.type = 'button';
      open.draggable = !bound;
      if (!bound) open.setAttribute('aria-keyshortcuts', 'ArrowUp ArrowDown');
      open.addEventListener('keydown', (event) => {
        if (bound) return;
        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
        event.preventDefault();
        const index = listDraft.indexOf(entry) + (event.key === 'ArrowUp' ? -1 : 1);
        if (index >= 0 && index < listDraft.length) {
          moveListEntry(entry, index);
          open.focus({ preventScroll: true });
        }
      });
      open.addEventListener('dragstart', ({ dataTransfer }) => {
        if (bound) return;
        draggedListEntry = entry;
        dataTransfer.effectAllowed = 'move';
        dataTransfer.setData('application/x-social-list-item', String(listDraft.indexOf(entry)));
        dataTransfer.setDragImage(row, 12, row.offsetHeight / 2);
      });
      open.addEventListener('dragend', () => { draggedListEntry = null; });
      row.addEventListener('dragover', (event) => {
        if (!draggedListEntry) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        if (draggedListEntry === entry) return;
        const from = listDraft.indexOf(draggedListEntry);
        const to = listDraft.indexOf(entry);
        const { top, height } = row.getBoundingClientRect();
        const lowerHalf = event.clientY >= top + height / 2;
        if ((from < to) === lowerHalf) moveListEntry(draggedListEntry, to);
      });
      row.addEventListener('drop', (event) => {
        if (!draggedListEntry) return;
        event.preventDefault();
        draggedListEntry = null;
      });
      open.addEventListener('click', () => openSocialDetail(entry, icon, open));
      const actions = document.createElement('div');
      actions.className = 'social-list__actions';
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = '\uE65C';
      remove.setAttribute('aria-label', 'Удалить · ' + label);
      remove.disabled = Boolean(draftRemovedItem);
      remove.addEventListener('click', () => removeListItem(entry));
      const more = document.createElement('button');
      more.type = 'button';
      more.textContent = '\uE9D9';
      more.setAttribute('aria-label', 'Настройки · ' + label);
      more.addEventListener('click', () => openSocialDetail(entry, icon, open));
      actions.append(remove, more);
      row.append(actions);
    });
    if (reposition) positionConstructorPopup(socialList, activeListTrigger);
  }

  function moveListEntry(entry, index) {
    const from = listDraft.indexOf(entry);
    const rows = socialListRows.children;
    const source = rows[from];
    // Keep the native drag source connected while its neighbours move around it.
    if (from < index) {
      for (let position = from; position < index; position++) source.before(source.nextElementSibling);
    } else {
      for (let position = from; position > index; position--) source.after(source.previousElementSibling);
    }
    listDraft.splice(from, 1);
    listDraft.splice(index, 0, entry);
  }

  function resetSocialDetail() {
    socialDetailName.value = detailEntry.name ?? detailEntry.button.getAttribute('aria-label');
    socialDetailLink.value = detailEntry.value;
    if (detailEntry.newTab) socialDetailTab.checked = true;
    else socialDetailPage.checked = true;
  }

  function openSocialDetail(entry, icon, trigger) {
    detailEntry = entry;
    detailTrigger = trigger;
    $('socialDetailIcon').replaceChildren(icon.cloneNode());
    resetSocialDetail();
    $('socialListTitle').textContent = 'Соцсеть';
    socialListBody.hidden = true;
    socialListBack.hidden = false;
    socialDetail.hidden = false;
    socialDetailLink.focus({ preventScroll: true });
  }

  function openSocialAppearance() {
    closeColorModes(false);
    closeSocialColor();
    closeSocialStyle(false);
    const sample = getComputedStyle(socialItems.querySelector('.social-item:not([hidden])') ?? socialItemStyle);
    $('socialAppearanceRadius').textContent = parseFloat(sample.borderTopLeftRadius) || '0';
    $('socialAppearanceIconSize').textContent = parseFloat(sample.getPropertyValue('--btn-is')) || '24';
    for (const [id, token] of [
      ['socialAppearanceBorder', '--btn-bd'],
      ['socialAppearanceFill', '--btn-bg'],
      ['socialAppearanceText', '--btn-fg'],
      ['socialAppearanceIcon', '--btn-ic'],
    ]) {
      const swatch = $(id);
      const value = sample.getPropertyValue(token).trim();
      swatch.classList.toggle('is-empty', !value || value === 'transparent');
      swatch.style.setProperty('--pe-color', swatch.classList.contains('is-empty') ? '' : value);
    }
    $('socialListTitle').textContent = 'Оформление';
    socialListBody.hidden = true;
    socialListBack.hidden = false;
    socialListReset.disabled = true;
    socialAppearance.hidden = false;
    setPopupTrigger(socialAppearanceToggle, true);
    socialListBack.focus({ preventScroll: true });
  }

  function closeSocialAppearance(restoreFocus) {
    if (socialAppearance.hidden) return;
    $('socialListTitle').textContent = 'Соцсети';
    socialAppearance.hidden = true;
    socialListBack.hidden = true;
    socialListBody.hidden = false;
    socialListReset.disabled = false;
    setPopupTrigger(socialAppearanceToggle, false);
    if (restoreFocus) socialAppearanceToggle.focus({ preventScroll: true });
  }

  function closeSocialDetail(save, restoreFocus) {
    if (!detailEntry) return;
    const rowIndex = listDraft.indexOf(detailEntry);
    if (save) {
      detailEntry.name = socialDetailName.value.trim();
      detailEntry.value = socialDetailLink.value.trim();
      detailEntry.newTab = socialDetailTab.checked;
    }
    detailEntry = null;
    $('socialListTitle').textContent = activeListTrigger === socialGeneralToggle ? 'Соцсети' : 'Список';
    socialDetail.hidden = true;
    socialListBack.hidden = true;
    socialListBody.hidden = false;
    if (save) renderSocialList(false);
    if (restoreFocus) {
      const rowTrigger = detailTrigger.isConnected ? detailTrigger
        : socialListRows.children[rowIndex]?.querySelector('button.social-list__open');
      const trigger = rowTrigger && !socialListManual.hidden ? rowTrigger : socialList.querySelector('.pe__close');
      trigger.focus({ preventScroll: true });
    }
    detailTrigger = null;
  }

  function closeSocialList(restoreFocus) {
    closeSocialColor();
    closeColorModes(false);
    closeSocialAppearance(false);
    if (activeStyleTrigger === socialItemStyle) closeSocialStyle(false);
    if (activeSizeTrigger === socialItemSizeToggle) closeSocialSize(false);
    restoreWidgetItems();
    savedWidgetItems = null;
    renderItemColor(itemColor);
    const hadDraftLayouts = draftItemLayouts !== null;
    draftItemLayouts = null;
    if (hadDraftLayouts || displayedStyle !== appliedStyle || sel.dataset.colorMode !== itemColorMode) {
      sel.dataset.colorMode = itemColorMode;
      renderWidgetStyle(appliedStyle);
    }
    socialList.hidden = true;
    socialList.classList.remove('is-keyboard-navigation');
    pinnedListPosition = null;
    socialList.style.removeProperty('--social-list-body-height');
    draggedListEntry = null;
    closeSocialDetail(false, false);
    updateSocialListToggle(sel.dataset.context ?? demoContext);
    setPopupTrigger(activeListTrigger, false);
    if (restoreFocus) activeListTrigger.focus({ preventScroll: true });
  }

  function updateItemSizeButtons() {
    const index = itemSizes.indexOf(draftItemSize);
    for (const button of socialGeneralFields.querySelectorAll('[data-social-size-step]')) {
      button.disabled = !itemSizes[index + Number(button.dataset.socialSizeStep)];
    }
  }

  function setDraftStyle(option) {
    if (draftStyle) socialItemStyle.classList.remove(...styleClasses(draftStyle));
    draftStyle = option;
    socialItemStyle.classList.add(...styleClasses(option));
    socialItemStyle.classList.toggle('social-button--brand', draftItemColorMode === 'brand');
    const first = socialItems.querySelector('.social-item:not([hidden])');
    socialItemStyle.dataset.network = first?.dataset.network ?? '';
    const label = option.getAttribute('aria-label');
    socialItemStyleLabel.textContent = option.dataset.shortLabel || label;
    socialItemStyle.setAttribute('aria-label', 'Стиль пунктов: ' + label);
    updateSocialStylePreview();
  }

  function updateSocialStylePreview() {
    const content = socialGeneralFields.querySelector('[name="socialContent"]:checked').value;
    socialItemStyleIcon.hidden = content === 'text';
    socialItemStyleLabel.hidden = content === 'icon';
    socialItemStyle.classList.toggle('btn--icon', content === 'icon');
  }

  function resetSocialGeneral() {
    closeSocialStyle(false);
    closeColorModes(false);
    draftItemColorMode = itemColorMode;
    draftItemLayouts = new Map(itemLayouts);
    draftItemSize = itemSize;
    setDraftStyle(appliedStyle);
    sel.dataset.colorMode = itemColorMode;
    renderWidgetStyle(appliedStyle);
    updateColorModeControls();
    draftItemColor = itemColor;
    renderSocialColor(socialColorToggle, draftItemColor);
    renderItemColor(itemColor);
    updateItemSizeButtons();
  }

  function saveSocialGeneral() {
    closeSocialStyle(false);
    itemColor = draftItemColor;
    itemColorMode = draftItemColorMode;
    itemSize = draftItemSize;
    for (const [key, layout] of draftItemLayouts) itemLayouts.set(key, layout);
    selectSocialStyle(draftStyle);
  }

  for (const input of socialGeneralFields.querySelectorAll('[name="socialContent"]')) {
    input.addEventListener('change', updateSocialStylePreview);
  }
  for (const button of socialGeneralFields.querySelectorAll('[data-social-size-step]')) {
    button.addEventListener('click', () => {
      const index = itemSizes.indexOf(draftItemSize) + Number(button.dataset.socialSizeStep);
      draftItemSize = itemSizes[index];
      renderWidgetStyle(draftStyle);
      updateItemSizeButtons();
    });
  }

  function openSocialList(event, position = null) {
    const trigger = event.currentTarget;
    if (!socialList.hidden && trigger === activeListTrigger) {
      closeSocialList(true);
      return;
    }
    closeSocialAdd(false);
    closeSocialStyle(false);
    closeSocialSize(false);
    closeSocialList(false);
    activeListTrigger = trigger;
    pinnedListPosition = position;
    const general = trigger === socialGeneralToggle;
    $('socialListTitle').textContent = general ? 'Соцсети' : 'Список';
    socialGeneralFields.hidden = !general;
    if (general) resetSocialGeneral();
    socialList.hidden = false;
    setPopupTrigger(trigger, true);
    savedWidgetItems = [...socialItems.children];
    resetSocialList();
    socialList.querySelector('.pe__close').focus({ preventScroll: true });
  }
  socialListToggle.addEventListener('click', openSocialList);
  socialGeneralToggle.addEventListener('click', openSocialList);
  socialList.querySelector('.pe__close').addEventListener('click', () => closeSocialList(true));
  socialAppearanceToggle.addEventListener('click', openSocialAppearance);
  socialListBack.addEventListener('click', () => {
    if (socialAppearance.hidden) closeSocialDetail(false, true);
    else closeSocialAppearance(true);
  });
  socialListReset.addEventListener('click', () => {
    closeSocialColor();
    if (detailEntry) resetSocialDetail();
    else {
      if (activeListTrigger === socialGeneralToggle) resetSocialGeneral();
      resetSocialList();
    }
  });
  socialListAdd.addEventListener('click', addListItem);
  socialList.querySelector('.pe__done').addEventListener('click', () => {
    if (!socialAppearance.hidden) {
      closeSocialAppearance(true);
      return;
    }
    if (detailEntry) {
      closeSocialDetail(true, true);
      return;
    }
    sel.dataset.context = socialListContext.value;
    socialItems.replaceChildren(...listDraft.map(({ button, value, hidden, newTab, name, manual }) => {
      button.dataset.link = value.trim();
      button.dataset.newTab = String(Boolean(newTab));
      if (manual) button.dataset.manual = 'true';
      if (name !== undefined) {
        button.dataset.name = name;
        button.querySelector('.btn__caption').textContent = name;
      }
      button.hidden = hidden;
      applyItemPresentation(button);
      return button;
    }));
    removedItem = draftRemovedItem;
    savedWidgetItems = null;
    if (activeListTrigger === socialGeneralToggle) saveSocialGeneral();
    closeSocialList(true);
    toBottom();
  });

  function closeSocialStyle(restoreFocus) {
    if (socialStyle.hidden) return;
    socialStyle.hidden = true;
    if (activeStyleTrigger === socialItemStyle) {
      markSocialStyle(socialButtonPresets, previousButtonStyle);
      previousButtonStyle = null;
      showStyleMenu(socialStylePreviews);
      socialStyle.classList.remove('social-style--settings');
      socialStyle.style.removeProperty('left');
      socialStyle.style.removeProperty('top');
      socialStyleToolbar.append(socialStyle);
    }
    setPopupTrigger(activeStyleTrigger, false);
    if (restoreFocus) activeStyleTrigger.focus({ preventScroll: true });
    activeStyleTrigger = socialStyleToggle;
  }

  function toggleSocialStyle({ currentTarget: trigger }) {
    if (!socialStyle.hidden && activeStyleTrigger === trigger) {
      closeSocialStyle(true);
      return;
    }
    openSocialStyle(trigger);
  }
  socialStyleToggle.addEventListener('click', toggleSocialStyle);
  socialItemStyle.addEventListener('click', toggleSocialStyle);

  function openSocialStyle(trigger) {
    closeSocialStyle(false);
    closeSocialColor();
    closeSocialAdd(false);
    closeSocialSize(false);
    if (trigger === socialItemStyle) {
      socialStyle.classList.add('social-style--settings');
      document.body.append(socialStyle);
      previousButtonStyle = socialButtonPresets.querySelector('.social-style__option[aria-pressed="true"]');
      showStyleMenu(socialButtonPresets);
      markSocialStyle(socialButtonPresets, matchStyleOption(socialButtonPresets, draftStyle));
    } else {
      closeSocialList(false);
      renderToolbarStyleMenu();
    }
    activeStyleTrigger = trigger;
    socialStyle.hidden = false;
    setPopupTrigger(trigger, true);
    positionSocialStyle();
    const option = selectedStyle() ?? socialStyle.querySelector(':scope > :not([hidden]) .social-style__option');
    option.focus({ preventScroll: true });
  }

  socialStyle.querySelector('.social-style__close').addEventListener('click', () => closeSocialStyle(true));
  socialStyle.addEventListener('click', (event) => {
    const option = event.target.closest('.social-style__option');
    if (!option) return;
    if (activeStyleTrigger === socialItemStyle) {
      setDraftStyle(option);
      renderWidgetStyle(option);
    }
    else selectToolbarStyle(option);
    closeSocialStyle(true);
  });

  document.addEventListener('pointerdown', (event) => {
    if (event.target.closest('#socialScenarioGroups')) return;
    socialList.classList.remove('is-keyboard-navigation');
    const insideColorModes = !socialColorModes.hidden && socialColorModes.contains(event.target);
    if (!insideColorModes && !$('socialColorControls').contains(event.target)) closeColorModes(false);
    const insideColor = !socialColor.hidden && socialColor.contains(event.target);
    if (!insideColor && !activeColorTrigger.contains(event.target)) closeSocialColor();
    const insideStyle = !socialStyle.hidden && socialStyle.contains(event.target);
    if (!insideStyle && !activeStyleTrigger.contains(event.target)) {
      closeSocialStyle(false);
    }
    if (!socialAdd.hidden && !socialAdd.contains(event.target) && !socialAddTrigger.contains(event.target)) {
      closeSocialAdd(false);
    }
    const insideDrillIn = activeSizeTrigger === socialItemSizeToggle && socialSize.contains(event.target);
    if (!socialList.hidden && !socialList.contains(event.target) && !activeListTrigger.contains(event.target) &&
        !socialAdd.contains(event.target) && !insideColor && !insideColorModes && !insideStyle && !insideDrillIn) {
      closeSocialList(false);
    }
    if (!socialSize.hidden && !socialSize.contains(event.target) && !activeSizeTrigger.contains(event.target)) {
      closeSocialSize(false);
    }
  });
  document.addEventListener('keydown', (event) => {
    if (!socialList.hidden && event.key === 'Tab') socialList.classList.add('is-keyboard-navigation');
    if (event.key !== 'Escape') return;
    if (socialColor.hidden && socialStyle.hidden && socialAdd.hidden && socialList.hidden && socialSize.hidden) return;
    event.preventDefault();
    if (!socialColor.hidden) closeSocialColor(true);
    else if (!socialColorModes.hidden) closeColorModes(true);
    else if (!socialSize.hidden) closeSocialSize(true);
    else if (!socialStyle.hidden) closeSocialStyle(true);
    else if (!socialAdd.hidden) closeSocialAdd(true);
    else if (detailEntry) closeSocialDetail(false, true);
    else if (!socialAppearance.hidden) closeSocialAppearance(true);
    else closeSocialList(true);
  });
  window.addEventListener('resize', positionSocialPopups);

  const chain = [];
  for (let c = sel.parentElement && sel.parentElement.closest('.stk'); c; c = c.parentElement && c.parentElement.closest('.stk')) chain.push(c);
  chain.forEach((c, n) => {
    c.classList.add('is-ctx');
    if (n === 0) c.classList.add('is-ctx-near');
    const horiz = c.classList.contains('stk--h');
    const kids = Array.from(c.children).filter((k) => k.classList.contains('stk') && !k.classList.contains('foot__apps'));
    const padStart = parseFloat(getComputedStyle(c)[horiz ? 'paddingLeft' : 'paddingTop']) || 0;
    kids.forEach((k, i) => {
      if (chain.includes(k)) return;                            // у стека из цепочки своя полная рамка
      const prev = kids[i - 1];
      if (i === 0 ? padStart > 0 : !chain.includes(prev)) k.classList.add(horiz ? 'is-div-h' : 'is-div-v');
    });
  });

  /* Ресайзеры ширины страницы (только ховер, без перетаскивания) */
  const page = $('page'), canvas = page.parentElement;
  const setPw = (w) => { page.style.width = w + 'px'; canvas.style.setProperty('--pw', w + 'px'); };
  setPw(page.offsetWidth);
  /* Тянуть края пока не нужно: остаётся только ховер (стили .drag:hover) */

  /* Левый сайдбар «Страницы»: линии у края, панель выезжает по наведению */
  LeftSidebar.mount($('lsb'), {
    pages: [
      { id: 1, name: 'Главная', home: true },
      { id: 2, name: 'Тарифы' },
      { id: 3, name: 'Контакты' },
      { id: 4, name: 'Материалы' },
      { id: 5, name: 'Поддержка' },
    ],
    active: 1,
  });

  /* Клики в левом сайдбаре не нужны: остаётся только ховер */
  ['click', 'dblclick', 'mousedown', 'contextmenu', 'keydown'].forEach((t) =>
    $('lsb').addEventListener(t, (e) => { if (!e.target.closest('.lsb__toggle')) { e.stopPropagation(); e.preventDefault(); } }, true));

  /* Страница открыта на подвале: прокручена вниз, как в макете */
  const toBottom = () => { scroller.scrollTop = scroller.scrollHeight; };
  toBottom();
  window.addEventListener('load', toBottom);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(toBottom);

  /* Рамка demo-frame: сцена 1600×900 в натуральную величину, панель сценариев справа */
  const frame = DemoFrame.mount({
    stage: $('stage'),
    top: 4,
    fixedScale: 1,   // демо всегда 1:1 — одинаково в любом браузере; в маленьком окне страница прокручивается
    onScale: () => {
      // сдвиг сцены — в целые физические пиксели, чтобы тонкие линии не размывались
      const st = $('stage');
      st.style.transform = st.style.transform.replace(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/, (m, a, b) =>
        'translate(' + Math.round(a * dpr()) / dpr() + 'px, ' + Math.round(b * dpr()) / dpr() + 'px)');
    },
    links: [],
    team: [],
  });
  frame.panel.querySelector('.df-panel__top').append($('socialScenarioTemplate').content.cloneNode(true));
  $('socialScenarioGroups').addEventListener('change', ({ target }) => {
    if (target.name === 'socialItemScenario') {
      itemScenario = target.value;
      updateSocialListToggle(socialList.hidden ? (sel.dataset.context ?? demoContext) : socialListContext.value);
      if (!socialList.hidden) renderSocialList(!socialListBody.hidden);
      if (!socialAdd.hidden) {
        if (socialAddTrigger.hidden) closeSocialAdd(false);
        else positionConstructorPopup(socialAdd, socialAddTrigger);
      }
    } else {
      appearanceScenario = target.value;
      if (!socialStyle.hidden && activeStyleTrigger === socialStyleToggle) {
        renderToolbarStyleMenu();
        positionSocialStyle();
      }
    }
  });
})();
