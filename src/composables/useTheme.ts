import { onMounted, ref } from 'vue';

const STORAGE_KEY = 'sag-demo-theme';

type Theme = 'light' | 'dark';

const theme = ref<Theme>('dark');

function apply (next: Theme): void {
    theme.value = next;
    document.documentElement.classList.toggle('dark', next === 'dark');
    document.documentElement.style.colorScheme = next;
}

/**
 * Light/dark preference, remembered across visits.
 *
 * The initial choice is made by an inline script in `index.html` so there is no flash of the wrong theme; this
 * just reads back what that script decided and lets the header toggle change it.
 */
export function useTheme () {

    onMounted(() => {
        apply(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });

    function toggle (): void {
        const next: Theme = theme.value === 'dark' ? 'light' : 'dark';
        apply(next);
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // Nothing to do — the choice simply will not persist.
        }
    }

    return { theme, toggle };
}
