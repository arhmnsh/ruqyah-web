import { reactive, watch } from 'vue';

// Preferences that survive reloads: how much of the wird to show, who it is recited for, and font size.
export const FORM_SHORT = 'short';
export const FORM_LONG = 'long';
export const TARGET_SELF = 'self';
export const TARGET_HIM = 'him';
export const TARGET_HER = 'her';

export const FONT_SIZE_SMALL = 'small';
export const FONT_SIZE_MEDIUM = 'medium';
export const FONT_SIZE_LARGE = 'large';
export const FONT_SIZE_XLARGE = 'xlarge';

export const FORMS = [FORM_SHORT, FORM_LONG];
export const TARGETS = [TARGET_SELF, TARGET_HIM, TARGET_HER];
export const FONT_SIZES = [FONT_SIZE_SMALL, FONT_SIZE_MEDIUM, FONT_SIZE_LARGE, FONT_SIZE_XLARGE];

const STORAGE_KEY = 'ruqyah-settings-v1';
const DEFAULTS = { form: FORM_SHORT, target: TARGET_SELF, fontSize: FONT_SIZE_MEDIUM };

function applyFontSizeToDom(size) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-font-size', size);
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const fontSize = FONT_SIZES.includes(parsed?.fontSize) ? parsed.fontSize : DEFAULTS.fontSize;
    applyFontSizeToDom(fontSize);
    return {
      form: FORMS.includes(parsed?.form) ? parsed.form : DEFAULTS.form,
      target: TARGETS.includes(parsed?.target) ? parsed.target : DEFAULTS.target,
      fontSize,
    };
  } catch {
    applyFontSizeToDom(DEFAULTS.fontSize);
    return { ...DEFAULTS };
  }
}

export const settings = reactive(load());

watch(
  () => ({ form: settings.form, target: settings.target, fontSize: settings.fontSize }),
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // ignore storage failures
    }
    applyFontSizeToDom(value.fontSize);
  },
);

export function setForm(form) {
  if (FORMS.includes(form)) settings.form = form;
}

export function setTarget(target) {
  if (TARGETS.includes(target)) settings.target = target;
}

export function setFontSize(size) {
  if (FONT_SIZES.includes(size)) {
    settings.fontSize = size;
    applyFontSizeToDom(size);
  }
}

export function cycleFontSize(direction) {
  const currentIndex = FONT_SIZES.indexOf(settings.fontSize);
  const nextIndex = Math.min(Math.max(currentIndex + direction, 0), FONT_SIZES.length - 1);
  if (nextIndex !== currentIndex) {
    setFontSize(FONT_SIZES[nextIndex]);
    return FONT_SIZES[nextIndex];
  }
  return settings.fontSize;
}
