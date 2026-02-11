import { APICaller } from "$lib/logic/api/api";
import { navigateTo } from "../view/navigation";
import { validateUsername, validatePassword, passwordMatch } from "../validation/auth";
import { userAuthenticated, userConfigSetup } from "$lib/stores/view/navigation";
import type { APIDescriptor } from "$lib/logic/api/api";
import { showToast } from "../view/toast";
import { AlertType } from "$lib/stores/view/toast";

/**
 * Authenticates user with username and password credentials.
 * Validates inputs, sends login request, and navigates to dashboard on success.
 *
 * @param username - User's username for authentication.
 * @param password - User's password for authentication.
 * @param autoLogin - Whether to enable automatic login for future sessions.
 */
export function loginUserAPI(username: string, password: string, autoLogin: boolean): APIDescriptor<void> {
    return {
        async call({ signal, timeout } = {}, requestId) {
            const validInputs: boolean = validateUsername(username) && validatePassword(password);
            if (!validInputs) return;
            const { sucess, data } = await APICaller.callAPI({
                endpoint: "/api/auth/login",
                method: "POST",
                requestId,
                params: {
                    username,
                    password,
                    auto_login: autoLogin,
                },
                signal,
                timeout,
            });
            userAuthenticated.set(sucess);
            if (sucess) {
                await navigateTo("/devices/dashboard", {}, true, true); // Navigate to the dashboard on success
            }
        },
    };
}

/**
 * Creates an API descriptor to perform the initial user configuration.
 *
 * This function validates the provided username and passwords locally before
 * sending a request to the backend. If validation fails, the API call is not
 * executed. On successful user creation, the initial setup state is cleared.
 *
 * @param username - Desired username for the initial account
 * @param password - Password for the account
 * @param confirm_password - Password confirmation (must match `password`)
 * @returns An APIDescriptor that executes the user creation request
 */
export function createUserConfigAPI(username: string, password: string, confirm_password: string): APIDescriptor<void> {
    return {
        async call({ signal, timeout } = {}, requestId) {
            const validInputs: boolean = validateUsername(username) && validatePassword(password) && passwordMatch(password, confirm_password);
            if (!validInputs) return;
            const { sucess, data } = await APICaller.callAPI({
                endpoint: "/api/auth/create_login",
                method: "POST",
                requestId,
                params: {
                    username,
                    password,
                    confirm_password,
                },
                signal,
                timeout,
            });
            if (sucess) {
                userConfigSetup.set(false);
                showToast("USER_CONFIG_SUCESS", AlertType.INFO, {}, "apiAuthorization");
            }
        },
    };
}

/**
 * Checks the current authentication session state with the backend.
 *
 * Sends a request to the server to determine whether a valid authenticated
 * session exists. This function does not perform navigation, redirects, or
 * authorization decisions; it only reflects the session status returned by
 * the backend and updates client-side authentication state accordingly.
 *
 * If the backend reports that no user configuration exists, the client is
 * flagged to enter the initial setup flow.
 *
 * Intended for client-side initialization logic such as auto-login checks
 * and UI state restoration. Final access control and routing remain enforced
 * by server-side guards.
 *
 * @returns Object indicating whether the current session is authenticated.
 */
export function autoLoginAPI(): APIDescriptor<{ sucess: boolean }> {
    return {
        async call({ signal, timeout } = {}, requestId) {
            const { sucess, data } = await APICaller.callAPI({
                endpoint: "/api/auth/auto_login",
                method: "POST",
                requestId,
                signal,
                timeout,
            });
            if (data?.error_code === "USER_CONFIG_NOT_FOUND") userConfigSetup.set(true);
            userAuthenticated.set(sucess);
            return { sucess };
        },
    };
}

/**
 * Logs out the current user and redirects to login page.
 * Sends logout request to server and navigates to login on success.
 */
export function logoutUserAPI(): APIDescriptor<void> {
    return {
        async call({ signal, timeout } = {}, requestId) {
            const { sucess, data } = await APICaller.callAPI({
                endpoint: "/api/auth/logout",
                method: "POST",
                requestId,
                signal,
                timeout,
            });
            if (sucess) {
                userAuthenticated.set(false);
                await navigateTo("/login", {}, true, true);
            }
        },
    };
}
