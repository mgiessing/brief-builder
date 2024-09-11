// Accessing environment variable in server-side code
const backendUrl = import.meta.env.VITE_BACKEND_BASE_URL;

// Log the backend URL to check if it's correctly accessed
console.log("Backend URL:", backendUrl);

export async function POST({ request }) {
    
    const { prompt, max_tokens } = await request.json();

    try {
        const response = await fetch(`${backendUrl}/stream`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt, max_tokens }),
        });

        if (!response.body) {
            return new Response("No response body", { status: 500 });
        }

        // Stream the response from the backend to the client
        return new Response(response.body, { status: 200 });
    } catch (error) {
        console.error("Error streaming data:", error);
        return new Response("Server error", { status: 500 });
    }
}