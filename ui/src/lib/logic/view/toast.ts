import { toastTimeout, toastKey, toastVariables, activeToastTextList, toastType, displayToast } from "$lib/stores/view/toast";
import { AlertType } from "$lib/stores/view/toast";
import type { AlertTextList } from "$lib/stores/view/toast";


/**
 * Displays a toast notification with the given message key and type.
 *
 * If a toast is already visible, it is replaced and its auto-close timer
 * is reset. When autoClose is enabled, the toast is automatically hidden
 * after a short delay.
 *
 * @param key Localization key for the toast message.
 * @param type Visual type of the toast (e.g. error, warning, success).
 * @param variables Optional variables used for message interpolation.
 * @param autoClose Whether the toast should close automatically after a delay.
 */
export function showToast(key: string, type: AlertType, variables?: Record<string, string | number>, textList: AlertTextList = "general", autoClose: boolean = true) {
    toastTimeout.update((old) => {
        if (old) clearTimeout(old);
        return null;
    });

    activeToastTextList.set(textList);
    toastKey.set(key);
    toastVariables.set(variables);
    toastType.set(type);
    displayToast.set(true);
    if (autoClose) {
        const id = setTimeout(() => displayToast.set(false), 5000);
        toastTimeout.set(id);
    }
}

/**
 * Closes the toast popup and clears its timeout.
 */
export function closeToast() {
    toastTimeout.update((id) => {
        if (id) clearTimeout(id);
        return null;
    });
    displayToast.set(false);
}
