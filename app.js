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
  const socialAdd = $('socialAdd');
  const constructor = $('app');
  const socialList = $('socialList');
  const socialListToggle = $('socialListToggle');
  const socialListToggleIcon = socialListToggle.querySelector('.tb__icon');
  const socialListToggleCaption = socialListToggle.querySelector('.tb__caption');
  const socialGeneralToggle = $('socialGeneralToggle');
  const socialGeneralFields = $('socialGeneralFields');
  const socialItemStyle = $('socialItemStyle');
  const formPreviews = [socialItemStyle, ...socialButtonPresets.querySelectorAll('.btn')];
  for (const preview of formPreviews.slice(1)) {
    preview.replaceChildren(...Array.from(socialItemStyle.children, (element) => element.cloneNode(true)));
  }
  const socialAppearance = $('socialAppearance');
  const socialAppearanceToggle = $('socialAppearanceToggle');
  const socialColor = $('socialColor');
  const socialColorToggle = $('socialColorToggle');
  const socialItemColorLabel = $('socialItemColorLabel');
  const socialToolbarColorToggle = $('socialToolbarColorToggle');
  const socialColorModeToggle = $('socialColorModeToggle');
  const socialSettingsLayout = $('socialSettingsLayout');
  const socialWidgetDimensions = $('socialWidgetDimensions');
  const socialAppearanceCaption = socialColorModeToggle.querySelector('.btn__caption');
  const socialItemShapeToggle = $('socialItemShapeToggle');
  const socialShapeSettings = $('socialShapeSettings');
  const socialShapeForm = $('socialShapeForm');
  const socialWidgetSizeToggle = $('socialWidgetSizeToggle');
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
  constructor.append(socialList, socialAdd, socialSize, socialColor);
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
  const itemSizes = ['m', 'xl', '5xl'];
  let itemSize = 'xl';
  let draftItemSize = itemSize;
  const itemLayouts = new Map();
  let draftItemLayouts = null;
  const itemShapes = new Map();
  let draftItemShapes = null;
  let shapeState = 'rest';
  let shapeEntry;
  const shapeStates = ['rest', 'hover', 'active'];
  const shapeProperties = {
    radius: 'px', border: '', borderWidth: 'px', background: '', shadow: '',
    family: '', fontSize: 'px', text: '', icon: '', iconSize: 'px', gap: 'px',
  };
  let draftStyle = null;
  let itemColor = null;
  let draftItemColor = itemColor;
  let itemColorMode = 'custom';
  let draftItemColorMode = itemColorMode;
  let itemScenario = 'hide-with-context';
  updateSocialListToggle(sel.dataset.context ?? demoContext);
  let appearanceScenario = 'grouped';
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
    updateWidgetDimensions();
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
    applyShapeStyle(item, option);
  }

  function shapeKey(option) {
    return sel.dataset.colorMode + ':' + itemLayoutKey(option);
  }

  function applyShapeStyle(item, option) {
    const shape = (draftItemShapes ?? itemShapes).get(shapeKey(option));
    for (const state of shapeStates) {
      const values = shape?.[state] ?? {};
      for (const [name, unit] of Object.entries(shapeProperties)) {
        const value = values[name];
        const cssValue = name === 'shadow' && value ? '0 2px 6px ' + value : value;
        item.style.setProperty(`--shape-${state}-${name}`, cssValue ? cssValue + unit : '');
      }
      item.style.setProperty(`--shape-${state}-weight`, values.bold ? '700' : '');
      item.style.setProperty(`--shape-${state}-italic`, values.italic ? 'italic' : '');
      item.style.setProperty(`--shape-${state}-decoration`, [
        values.underline && 'underline', values.strike && 'line-through',
      ].filter(Boolean).join(' '));
    }
  }

  function positionSocialStyle() {
    if (socialStyle.hidden) return;
    const popup = socialStyle;
    popup.classList.remove('is-above');
    const panel = popup.getBoundingClientRect();
    if (activeStyleTrigger !== socialStyleToggle) {
      const anchor = (activeStyleTrigger === socialColorModeToggle ? socialAppearanceCaption : socialItemStyle).getBoundingClientRect();
      const first = popup.querySelector(':scope > :not([hidden]) .social-style__option');
      const sample = (first.firstElementChild ?? first).getBoundingClientRect();
      const left = anchor.left + (anchor.width - sample.width) / 2 - (sample.left - panel.left);
      const top = anchor.top + (anchor.height - sample.height) / 2 - (sample.top - panel.top);
      popup.style.left = window.scrollX + Math.max(4, Math.min(left, window.innerWidth - panel.width - 4)) + 'px';
      popup.style.top = window.scrollY + Math.max(4, Math.min(top, window.innerHeight - panel.height - 4)) + 'px';
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
    if (popup === socialAdd) {
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
      if (trigger === socialStyleToggle) {
        const anchor = trigger.getBoundingClientRect();
        const headerHeight = popup.querySelector('.pe__head').offsetHeight;
        const bottom = anchor.top - bounds.top - gap;
        popup.style.setProperty('--social-list-body-height', Math.max(0, bottom - headerHeight - gap) + 'px');
        const left = Math.min(anchor.left - bounds.left, constructor.clientWidth - popup.offsetWidth - gap);
        popup.style.left = Math.max(gap, left) + 'px';
        popup.style.top = Math.max(gap, bottom - popup.offsetHeight) + 'px';
        return;
      }
      const widget = sel.getBoundingClientRect();
      const left = widget.left - bounds.left - popup.offsetWidth - 6;
      const top = Math.min(toolbar.top - bounds.top - 2, constructor.clientHeight - popup.offsetHeight - gap);
      popup.style.left = Math.max(gap, left) + 'px';
      popup.style.top = Math.max(gap, top) + 'px';
      return;
    }
  }

  function positionSocialPopups() {
    positionConstructorPopup(socialList, activeListTrigger);
    positionSocialStyle();
    positionConstructorPopup(socialAdd, socialListAdd);
    positionSocialSize();
    positionSocialColor();
  }

  function setPopupTrigger(trigger, open) {
    trigger.setAttribute('aria-expanded', String(open));
    if (trigger.classList.contains('tb__btn')) trigger.classList.toggle('is-selected', open);
  }

  function sizeDrilledIn() {
    return activeSizeTrigger !== socialSizeToggle;
  }

  function positionSocialSize() {
    if (socialSize.hidden) return;
    const bounds = constructor.getBoundingClientRect();
    if (sizeDrilledIn()) {
      const panel = socialList.getBoundingClientRect();
      const top = panel.top - bounds.top;
      const available = constructor.clientHeight - top - socialSize.querySelector('.pe__head').offsetHeight - 8;
      socialSize.style.left = panel.left - bounds.left + 'px';
      socialSize.style.top = top + 'px';
      socialSize.style.setProperty('--social-size-body-height', Math.max(0, available) + 'px');
      return;
    }
    const anchor = socialSizeToggle.getBoundingClientRect();
    socialSize.style.left = Math.max(8, Math.min(anchor.left - bounds.left, constructor.clientWidth - socialSize.offsetWidth - 8)) + 'px';
    socialSize.style.top = Math.max(8, anchor.top - bounds.top - socialSize.offsetHeight - 4) + 'px';
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
      const value = target?.style[axis] || layout?.[axis];
      const mode = value === '100%' ? 'fill' : value ? 'px' : 'auto';
      sizeFields[axis + 'Mode'].value = mode;
      sizeFields[axis + 'Mode'].querySelector('[value="fill"]').disabled = itemSettings;
      sizeFields[axis].closest('.pe__dim').classList.toggle('pe__dim--auto', mode !== 'px');
    }
    for (const [field, [start, end]] of Object.entries(spacingProperties)) {
      const first = String(parseFloat(computed?.[start] ?? layout?.[start]) || 0);
      const second = String(parseFloat(computed?.[end] ?? layout?.[end]) || 0);
      sizeFields[start].value = first;
      sizeFields[end].value = second;
      writeSpacingPair(field, first, second);
      [start, end, field].forEach((name) => sizeFields[name].setCustomValidity(''));
    }
    $('socialSizeBetween').hidden = itemSettings;
    sizeFields.gap.disabled = itemSettings;
    sizeFields.gap.value = parseFloat(getComputedStyle(socialItems).gap) || 0;
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
    const drilledIn = trigger !== socialSizeToggle;
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
  socialWidgetSizeToggle.addEventListener('click', openSocialSize);
  socialSize.querySelector('.pe__back').addEventListener('click', () => {
    if (sizeDrilledIn()) {
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
      sizeFields[axis].closest('.pe__dim').classList.toggle('pe__dim--auto', sizeFields[axis + 'Mode'].value !== 'px');
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
        layout[axis] = mode === 'fill' ? '100%' : mode === 'px' ? sizeFields[axis].value + 'px' : '';
      }
    }
    if (key) {
      draftItemLayouts.set(key, layout);
      renderWidgetStyle(draftStyle);
    } else {
      if (sizeFields.gap.value !== initialSize.get('gap')) socialItems.style.gap = sizeFields.gap.value + 'px';
      updateWidgetDimensions();
    }
    closeSocialSize(true);
    toBottom();
  });

  const colorFields = socialColorForm.elements;
  const colorReset = socialColor.querySelector('.pe__reset');
  const defaultSocialColor = getComputedStyle(sel).getPropertyValue('--page-accent').trim();
  const colorPresets = [defaultSocialColor, '#656c87', '#000000', '#999999', '#8991a9', '#2562aa', '#5a49ab', '#cc3d00', '#c2140a', '#298e3c'];

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

  function updateColorModeControls() {
    const branded = draftItemColorMode === 'brand';
    socialColorToggle.hidden = branded;
    socialItemColorLabel.hidden = branded;
    socialAppearanceCaption.textContent = branded ? 'Брендированное' : 'Свое';
    socialItemStyle.dataset.colorMode = draftItemColorMode;
    socialButtonPresets.dataset.colorMode = draftItemColorMode;
  }

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

  function renderColorPresets() {
    $('socialColorPalette').replaceChildren(...colorPresets.map((hex) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'pe__pal';
      button.setAttribute('aria-label', hex);
      button.style.setProperty('--pe-color', hex);
      button.addEventListener('click', () => {
        const opacity = readSocialColorFields()?.opacity ?? 100;
        applySocialColor({ hex, opacity });
      });
      return button;
    }));
  }
  renderColorPresets();

  function openSocialColor({ currentTarget: trigger }) {
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
    setPopupTrigger(socialListAdd, false);
    if (restoreFocus) socialListAdd.focus({ preventScroll: true });
  }

  function openSocialAdd() {
    if (!socialAdd.hidden) {
      closeSocialAdd(true);
      return;
    }
    closeSocialStyle(false);
    closeSocialSize(false);
    socialAdd.hidden = false;
    setPopupTrigger(socialListAdd, true);
    positionConstructorPopup(socialAdd, socialListAdd);
    socialAdd.querySelector('.social-add__item').focus({ preventScroll: true });
  }
  socialAdd.querySelector('.social-add__close').addEventListener('click', () => closeSocialAdd(true));
  socialAddMore.addEventListener('click', () => {
    const expanded = socialAddExtra.hidden;
    socialAddExtra.hidden = !expanded;
    socialAddMore.setAttribute('aria-expanded', String(expanded));
    socialAddMore.setAttribute('aria-label', expanded ? 'Скрыть дополнительные соцсети' : 'Показать ещё соцсети');
    socialAddMore.firstElementChild.hidden = expanded;
    socialAddMore.lastElementChild.hidden = !expanded;
    positionConstructorPopup(socialAdd, socialListAdd);
    if (expanded) socialAddExtra.querySelector('.social-add__item').focus({ preventScroll: true });
  });

  socialAdd.addEventListener('click', (event) => {
    const option = event.target.closest('[data-network]');
    if (!option || socialList.hidden) return;
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
    const bound = Boolean(socialListContext.value);
    const entry = { button, value: '', hidden: false, manual: true };
    listDraft.push(entry);
    renderSocialList();
    closeSocialAdd(!bound);
    if (bound) {
      const row = socialListRows.lastElementChild;
      openSocialDetail(entry, row.querySelector('img'), row.querySelector('.social-list__open'));
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
    socialListContext.value = sel.dataset.context ?? demoContext;
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

  function addListItem() {
    if (!draftRemovedItem || socialListContext.value) {
      openSocialAdd();
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
    const hadContext = Boolean(socialListContext.value);
    socialListContext.value = value;
    socialListContext.disabled = bound;
    socialListContextPicker.disabled = bound;
    socialListClearContext.hidden = !bound;
    if (hadContext && !bound) {
      const manualNetworks = new Set(['vkontakte', 'max', 'ok']);
      listDraft = listDraft.filter((entry) => manualNetworks.has(entry.button.dataset.network));
      draftRemovedItem = null;
    }
    if (!hadContext && bound && savedWidgetItems) {
      listDraft = savedWidgetItems.map((button) => ({
        button, value: button.dataset.link || '', hidden: button.hidden,
        newTab: button.dataset.newTab === 'true',
        name: button.dataset.name, manual: button.dataset.manual === 'true',
      }));
      draftRemovedItem = removedItem;
      restoreWidgetItems();
    }
    updateSocialListToggle(value);
    renderSocialList(reposition);
  }

  function updateSocialListToggle(value) {
    socialListToggleIcon.textContent = value ? '\uEA6E' : '\uE708';
    socialListToggleIcon.classList.toggle('social-context-icon', Boolean(value));
    socialListToggleCaption.textContent = value.split('.').at(-1).trim() || 'Соцсети';
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
    if (!bound) {
      socialItems.replaceChildren(...listDraft.map((entry) => entry.button));
      for (const entry of listDraft) {
        entry.button.hidden = entry.hidden;
        applyItemPresentation(entry.button);
      }
    }
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
    socialItems.replaceChildren(...listDraft.map((item) => item.button));
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

  function generalSettingsTitle() {
    return activeListTrigger === socialStyleToggle ? 'Стиль' : 'Соцсети';
  }

  function renderShapeFields() {
    const values = draftItemShapes.get(shapeKey(draftStyle))?.[shapeState] ?? {};
    for (const field of socialShapeForm.elements) {
      if (!field.name) continue;
      const value = values[field.name];
      if (field.type === 'checkbox') field.checked = Boolean(value);
      else if (field.type === 'color') {
        field.value = value || '#000000';
        field.classList.toggle('is-empty', !value);
      } else field.value = value ?? '';
    }
    for (const button of socialShapeSettings.querySelectorAll('[data-shape-state]')) {
      button.setAttribute('aria-pressed', String(button.dataset.shapeState === shapeState));
    }
    socialItems.dataset.shapePreview = shapeState;
  }

  function openSocialShape() {
    closeSocialStyle(false);
    closeSocialColor();
    shapeState = 'rest';
    shapeEntry = draftItemShapes.get(shapeKey(draftStyle));
    renderShapeFields();
    socialListBody.hidden = true;
    socialShapeSettings.hidden = false;
    socialListBack.hidden = false;
    $('socialListTitle').textContent = 'Форма';
    setPopupTrigger(socialItemShapeToggle, true);
    positionConstructorPopup(socialList, activeListTrigger);
    socialListBack.focus({ preventScroll: true });
  }

  function closeSocialShape(restoreFocus) {
    if (socialShapeSettings.hidden) return;
    socialShapeSettings.hidden = true;
    socialListBody.hidden = false;
    socialListBack.hidden = true;
    $('socialListTitle').textContent = generalSettingsTitle();
    delete socialItems.dataset.shapePreview;
    setPopupTrigger(socialItemShapeToggle, false);
    if (restoreFocus) {
      positionConstructorPopup(socialList, activeListTrigger);
      socialItemShapeToggle.focus({ preventScroll: true });
    }
  }

  function editShapeField(name, value) {
    const key = shapeKey(draftStyle);
    const shape = draftItemShapes.get(key);
    const values = { ...shape?.[shapeState], [name]: value };
    draftItemShapes.set(key, { ...shape, [shapeState]: values });
    renderWidgetStyle(draftStyle);
  }

  socialShapeSettings.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-shape-state]');
    const clear = event.target.closest('[data-clear]');
    if (tab) {
      shapeState = tab.dataset.shapeState;
      renderShapeFields();
    } else if (clear) {
      editShapeField(clear.dataset.clear, '');
      renderShapeFields();
    }
  });
  socialShapeForm.addEventListener('input', ({ target }) => {
    if (!target.name || !target.validity.valid) return;
    editShapeField(target.name, target.type === 'checkbox' ? target.checked : target.value);
    if (target.type === 'color') target.classList.remove('is-empty');
  });
  socialShapeForm.addEventListener('submit', (event) => event.preventDefault());

  function openSocialAppearance() {
    closeSocialColor();
    closeSocialStyle(false);
    $('socialListTitle').textContent = 'Оформление';
    socialAppearance.prepend(socialSettingsLayout);
    socialAppearanceToggle.hidden = true;
    for (const control of socialSettingsLayout.querySelectorAll('.social-settings__direction')) control.hidden = false;
    socialListBody.hidden = true;
    socialListBack.hidden = false;
    socialListReset.disabled = true;
    socialAppearance.hidden = false;
    if (activeListTrigger === socialStyleToggle) positionConstructorPopup(socialList, activeListTrigger);
    setPopupTrigger(socialAppearanceToggle, true);
    socialListBack.focus({ preventScroll: true });
  }

  function closeSocialAppearance(restoreFocus) {
    if (socialAppearance.hidden) return;
    if (activeStyleTrigger === socialColorModeToggle) closeSocialStyle(false);
    closeSocialColor();
    $('socialListTitle').textContent = generalSettingsTitle();
    socialWidgetDimensions.before(socialSettingsLayout);
    socialAppearanceToggle.hidden = false;
    for (const control of socialSettingsLayout.querySelectorAll('.social-settings__direction')) control.hidden = true;
    socialAppearance.hidden = true;
    socialListBack.hidden = true;
    socialListBody.hidden = false;
    socialListReset.disabled = false;
    if (activeListTrigger === socialStyleToggle) positionConstructorPopup(socialList, activeListTrigger);
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
    closeSocialAdd(false);
    closeSocialColor();
    closeSocialAppearance(false);
    closeSocialShape(false);
    if (activeStyleTrigger !== socialStyleToggle) closeSocialStyle(false);
    if (sizeDrilledIn()) closeSocialSize(false);
    restoreWidgetItems();
    savedWidgetItems = null;
    renderItemColor(itemColor);
    applyWidgetContent(itemContent, itemDirection);
    const hadDraftLayouts = draftItemLayouts !== null;
    draftItemLayouts = null;
    draftItemShapes = null;
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

  let itemContent = 'icon';
  let itemDirection = 'row';
  let itemIconPosition = 'left';

  function applyWidgetContent(content, direction, iconPosition = itemIconPosition) {
    socialItems.dataset.direction = direction;
    socialItems.dataset.iconPosition = iconPosition;
    for (const item of socialItems.children) renderItemContent(item, content);
    updateWidgetDimensions();
  }

  function renderItemContent(item, content) {
    item.classList.toggle('btn--icon', content === 'icon');
    item.querySelector('.btn__caption').hidden = content === 'icon';
  }

  function updateWidgetDimensions() {
    for (const axis of ['Width', 'Height']) {
      const summary = $('social' + axis + 'Summary');
      const value = sel.style[axis.toLowerCase()];
      summary.firstElementChild.textContent = sel['offset' + axis];
      summary.lastElementChild.textContent = value === '100%' ? 'заполнить' : value ? 'px' : 'по контенту';
    }
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
    socialItemStyle.classList.add(...styleClasses(option).filter((name) => name !== 'social-button--brand'));
    const label = option.getAttribute('aria-label');
    socialItemStyle.setAttribute('aria-label', 'Стиль пунктов: ' + label);
    updateSocialStylePreview();
  }

  function updateSocialStylePreview() {
    const content = socialSettingsLayout.querySelector('[name="socialContent"]:checked').value;
    const position = socialSettingsLayout.querySelector('[name="socialIconPosition"]:checked').value;
    socialItemStyle.dataset.iconPosition = position;
    socialButtonPresets.dataset.iconPosition = position;
    for (const preview of formPreviews) renderItemContent(preview, content);
  }

  function resetSocialGeneral() {
    closeSocialStyle(false);
    draftItemColorMode = itemColorMode;
    draftItemLayouts = new Map(itemLayouts);
    draftItemShapes = new Map(itemShapes);
    draftItemSize = itemSize;
    socialSettingsLayout.querySelector(`[name="socialContent"][value="${itemContent}"]`).checked = true;
    socialSettingsLayout.querySelector(`[name="socialDirection"][value="${itemDirection}"]`).checked = true;
    socialSettingsLayout.querySelector(`[name="socialIconPosition"][value="${itemIconPosition}"]`).checked = true;
    applyWidgetContent(itemContent, itemDirection);
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
    itemContent = socialSettingsLayout.querySelector('[name="socialContent"]:checked').value;
    itemDirection = socialSettingsLayout.querySelector('[name="socialDirection"]:checked').value;
    itemIconPosition = socialSettingsLayout.querySelector('[name="socialIconPosition"]:checked').value;
    for (const [key, layout] of draftItemLayouts) itemLayouts.set(key, layout);
    for (const [key, shape] of draftItemShapes) itemShapes.set(key, shape);
    selectSocialStyle(draftStyle);
  }

  socialSettingsLayout.addEventListener('change', () => {
    updateSocialStylePreview();
    applyWidgetContent(socialSettingsLayout.querySelector('[name="socialContent"]:checked').value,
      socialSettingsLayout.querySelector('[name="socialDirection"]:checked').value,
      socialSettingsLayout.querySelector('[name="socialIconPosition"]:checked').value);
  });
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
    const general = trigger !== socialListToggle;
    socialList.classList.toggle('social-list--style-only', trigger === socialStyleToggle);
    $('socialListTitle').textContent = general ? generalSettingsTitle() : 'Список';
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
  socialItemShapeToggle.addEventListener('click', openSocialShape);
  socialListBack.addEventListener('click', () => {
    if (!socialShapeSettings.hidden) closeSocialShape(true);
    else if (socialAppearance.hidden) closeSocialDetail(false, true);
    else closeSocialAppearance(true);
  });
  socialListReset.addEventListener('click', () => {
    closeSocialColor();
    if (!socialShapeSettings.hidden) {
      draftItemShapes.set(shapeKey(draftStyle), shapeEntry);
      renderShapeFields();
      renderWidgetStyle(draftStyle);
    } else if (detailEntry) resetSocialDetail();
    else {
      if (activeListTrigger !== socialListToggle) resetSocialGeneral();
      resetSocialList();
    }
  });
  socialListAdd.addEventListener('click', addListItem);
  socialList.querySelector('.pe__done').addEventListener('click', () => {
    if (!socialShapeSettings.hidden) {
      closeSocialShape(true);
      return;
    }
    if (!socialAppearance.hidden) {
      closeSocialAppearance(true);
      return;
    }
    if (detailEntry) {
      closeSocialDetail(true, true);
      return;
    }
    if (activeListTrigger === socialStyleToggle) {
      saveSocialGeneral();
      closeSocialList(true);
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
    if (activeListTrigger !== socialListToggle) saveSocialGeneral();
    closeSocialList(true);
    toBottom();
  });

  function closeSocialStyle(restoreFocus) {
    if (socialStyle.hidden) return;
    socialStyle.hidden = true;
    if (activeStyleTrigger !== socialStyleToggle) {
      if (activeStyleTrigger !== socialColorModeToggle) markSocialStyle(socialButtonPresets, previousButtonStyle);
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
  socialStyleToggle.addEventListener('click', (event) => {
    if (appearanceScenario === 'advanced') openSocialList(event);
    else toggleSocialStyle(event);
  });
  socialColorModeToggle.addEventListener('click', toggleSocialStyle);
  socialItemStyle.addEventListener('click', toggleSocialStyle);

  function openSocialStyle(trigger) {
    closeSocialStyle(false);
    closeSocialColor();
    closeSocialAdd(false);
    closeSocialSize(false);
    if (trigger !== socialStyleToggle) {
      socialStyle.classList.add('social-style--settings');
      document.body.append(socialStyle);
      if (trigger === socialColorModeToggle) {
        showStyleMenu(socialStyleGroupedPresets);
        renderSocialStylePreviews(socialStyleGroupedPresets);
        markSocialStyle(socialStyleGroupedPresets, matchStyleOption(socialStyleGroupedPresets, draftStyle, draftItemColorMode === 'brand'));
      } else {
        previousButtonStyle = socialButtonPresets.querySelector('.social-style__option[aria-pressed="true"]');
        showStyleMenu(socialButtonPresets);
        markSocialStyle(socialButtonPresets, matchStyleOption(socialButtonPresets, draftStyle));
      }
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
    if (activeStyleTrigger !== socialStyleToggle) {
      if (activeStyleTrigger === socialColorModeToggle) {
        draftItemColorMode = styleClasses(option).includes('social-button--brand') ? 'brand' : 'custom';
        sel.dataset.colorMode = draftItemColorMode;
        updateColorModeControls();
      }
      setDraftStyle(option);
      renderWidgetStyle(option);
    }
    else selectToolbarStyle(option);
    closeSocialStyle(true);
  });

  document.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.social-scenarios')) return;
    socialList.classList.remove('is-keyboard-navigation');
    const insideColor = !socialColor.hidden && socialColor.contains(event.target);
    if (!insideColor && !activeColorTrigger.contains(event.target)) closeSocialColor();
    const insideStyle = !socialStyle.hidden && socialStyle.contains(event.target);
    if (!insideStyle && !activeStyleTrigger.contains(event.target)) {
      closeSocialStyle(false);
    }
    if (!socialAdd.hidden && !socialAdd.contains(event.target) && !socialListAdd.contains(event.target)) {
      closeSocialAdd(false);
    }
    const insideDrillIn = sizeDrilledIn() && socialSize.contains(event.target);
    if (!socialList.hidden && !socialList.contains(event.target) && !activeListTrigger.contains(event.target) &&
        !socialAdd.contains(event.target) && !insideColor && !insideStyle && !insideDrillIn) {
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
    else if (!socialSize.hidden) closeSocialSize(true);
    else if (!socialStyle.hidden) closeSocialStyle(true);
    else if (!socialAdd.hidden) closeSocialAdd(true);
    else if (detailEntry) closeSocialDetail(false, true);
    else if (!socialAppearance.hidden) closeSocialAppearance(true);
    else if (!socialShapeSettings.hidden) closeSocialShape(true);
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
  const scenarios = $('socialScenarioTemplate').content.cloneNode(true);
  frame.panel.querySelector('.df-panel__top').append(scenarios.querySelector('#socialScenarioGroups'));
  frame.panel.append(scenarios);
  frame.panel.addEventListener('change', ({ target }) => {
    if (target.name === 'socialItemScenario') {
      itemScenario = target.value;
      updateSocialListToggle(socialList.hidden ? (sel.dataset.context ?? demoContext) : socialListContext.value);
      if (!socialList.hidden) renderSocialList(!socialListBody.hidden);
      if (!socialAdd.hidden) {
        if (socialListAdd.hidden) closeSocialAdd(false);
        else positionConstructorPopup(socialAdd, socialListAdd);
      }
    } else if (target.name === 'socialAppearanceScenario') {
      appearanceScenario = target.value;
      if (activeListTrigger === socialStyleToggle && !socialList.hidden) closeSocialList(false);
      if (appearanceScenario === 'advanced' && activeStyleTrigger === socialStyleToggle) closeSocialStyle(false);
      socialStyleToggle.setAttribute('aria-controls', appearanceScenario === 'advanced' ? 'socialList' : 'socialStyle');
      if (!socialStyle.hidden && activeStyleTrigger === socialStyleToggle) {
        renderToolbarStyleMenu();
        positionSocialStyle();
      }
    }
  });
})();
