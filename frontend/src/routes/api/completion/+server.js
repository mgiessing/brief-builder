// Accessing environment variable in server-side code
const backendUrl = import.meta.env.VITE_BACKEND_BASE_URL;

// Log the backend URL to check if it's correctly accessed
console.log("Backend URL:", backendUrl);

export async function POST({ request }) {

    // Read the request body sent from the client
    const { prompt, max_tokens } = await request.json();

    try {
        // Forward the request to your backend
        const response = await fetch(`${backendUrl}/completion`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt,
                max_tokens
            }),
        });

        if (response.ok) {
            const data = await response.json();
            return new Response(JSON.stringify(data), { status: 200 });
        } else {
            return new Response("Error fetching completion", { status: response.status });
        }
    } catch (error) {
        console.error("Error:", error);
        return new Response("Server error", { status: 500 });
    }
}