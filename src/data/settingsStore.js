import { reactive, watch } from 'vue';

// Preferences that survive reloads: how much of the wird to show and who it is recited for.
export const FORM_SHORT = 'short';
export const FORM_LONG = 'long';
export const TARGET_SELF = 'self';
export const TARGET_HIM = 'him';
export const TARGET_HER = 'her';

export const FORMS = [FORM_SHORT, FORM_LONG];
export const TARGETS = [TARGET_SELF, TARGET_HIM, TARGET_HER];

const STORAGE_KEY = 'ruqyah-settings-v1';
const DEFAULTS = { form: FORM_SHORT, target: TARGET_SELF };

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return {
      form: FORMS.includes(parsed?.form) ? parsed.form : DEFAULTS.form,
      target: TARGETS.includes(parsed?.target) ? parsed.target : DEFAULTS.target,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export const settings = reactive(load());

watch(
  () => ({ form: settings.form, target: settings.target }),
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // ignore storage failures
    }
  },
);

export function setForm(form) {
  if (FORMS.includes(form)) settings.form = form;
}

export function setTarget(target) {
  if (TARGETS.includes(target)) settings.target = target;
}
