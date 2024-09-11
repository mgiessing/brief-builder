
// Accessing environment variable in server-side code
const backendUrl = import.meta.env.VITE_BACKEND_BASE_URL;

// Log the backend URL to check if it's correctly accessed
console.log("Backend URL:", backendUrl);

export async function GET() {
    let models = "";

    try {
        const response = await fetch(`${backendUrl}/models`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            models = await response.json();
            return new Response(JSON.stringify(models), { status: 200 });
        } else {
            return new Response("Error fetching models", { status: 500 });
        }
    } catch (error) {
        return new Response("Server error", { status: 500 });
    }
}
