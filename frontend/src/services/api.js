export const BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_APP_URL;

export async function apiFetch(
    endpoint,
    options = {}
) {

    let accessToken =
        localStorage.getItem("accessToken");

    console.log("TOKEN:", accessToken);

    console.log("URL:", `${BASE_URL}${endpoint}`);

    console.log("ACCESS TOKEN =", accessToken);

    console.log("HEADERS = ", {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
    });

    let response = await fetch(
        `${BASE_URL}${endpoint}`,
        {
            ...options,

            headers: {
                "Content-Type": "application/json",

                Authorization:
                    `Bearer ${accessToken}`,

                ...options.headers
            }
        }


    );

    // Access token expired
    if (response.status === 401) {

        // Request new access token
        const refreshResponse = await fetch(
            `${BASE_URL}/auth/refresh`,
            {
                method: "POST",
                credentials: "include",

                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        // Refresh failed
        if (!refreshResponse.ok) {

            logoutUser();

            return response;
        }

        const refreshData =
            await refreshResponse.json();

        // Save new access token
        localStorage.setItem(
    "accessToken",
    refreshData.accessToken
);

        // Retry original request
        response = await fetch(
            `${BASE_URL}${endpoint}`,
            {
                ...options,

                headers: {
                    "Content-Type": "application/json",

                    Authorization:
                        `Bearer ${refreshData.accessToken}`,

                    ...options.headers
                }
            }
        );
    }

    return response;
}

function logoutUser() {
    localStorage.removeItem("accessToken");

    window.location.href = "/login";
}
