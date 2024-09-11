<script>
    import { marked } from 'marked';
    import {
        Header,
        HeaderUtilities,
        HeaderGlobalAction,
        Content,
        Grid,
        Row,
        Column,
        TextArea,
        TextInput,
        Button,
        InlineLoading,
    } from "carbon-components-svelte";
    import SettingsAdjust from "carbon-icons-svelte/lib/SettingsAdjust.svelte";

    let showTextField = false;

    // Function to toggle the visibility of the text field
    function toggleTextField() {
        showTextField = !showTextField;
    }

    let BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

    console.log(import.meta.env.VITE_BACKEND_BASE_URL);

    let brief = "";
    let loading = false;
    let sampleText;

    //ToDo: Load async via sample file "sample-brief-gen.txt"
    const loadSampleText = () => {
        sampleText = `Generate a marketing campaign brief for a product manager based on the following information.

Write in a concise and professional tone

Company - Lyka
Feature - Sprint 2.0
Product Info - Lykas running shoes are designed for sprint runners who demand top notch performance, speed, comfort and style.  The campaign will have a modern, slick, and aspirational feel.
kick-off date - 11th July 2023 2:30 PM
Target audience - 20-40 age limits
Sales Objective - 30% increase in the next two months
Creativity - high-quality images, bold typography and bright colors`;
    };

    async function fetchChatCompletion() {
        brief = "";
        loading = true;

        try {
            // Call your server-side API route instead of directly calling the backend
            const response = await fetch("/api/completion", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: sampleText,
                    max_tokens: 50,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                brief = data;
                console.log(data);
            } else {
                console.error("Error fetching completion:", response.statusText);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            loading = false;
        }
    }

    async function fetchChatStream() {
        brief = "";
        loading = true;

        try {
            // Fetch from your server-side stream API
            const response = await fetch("/api/stream", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: sampleText,
                    max_tokens: 50
                }),
            });

            if (!response.body) {
                throw new Error("No response body");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            // Read the streamed data in chunks
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                brief += decoder.decode(value, { stream: true });
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            loading = false;
        }
    }
</script>

<svelte:head>
    <link
        rel="stylesheet"
        href="https://unpkg.com/carbon-components-svelte/css/white.css"
    />
</svelte:head>

<Header company="IBM" platformName="Brief Builder">
    <HeaderUtilities>
        <HeaderGlobalAction
          iconDescription="Settings"
          tooltipAlignment="start"
          icon={SettingsAdjust}
          on:click={toggleTextField}
        />
    </HeaderUtilities>
</Header>

<Content>
    <Grid>
        <Row>
            <Column>
                <p>Instructions and key points</p>
                <TextArea
                    style="height: 700px; font-size: 16px"
                    placeholder="To get started, use the provided Sample Text or type your own"
                    bind:value={sampleText}
                />
                <hr />
                <Button kind="tertiary" on:click={loadSampleText}
                    >Sample Text</Button
                >
                <Button disabled={loading} on:click={fetchChatCompletion}
                    >Generate Brief</Button
                >
                <Button disabled={loading} on:click={fetchChatStream}
                    >Stream Brief</Button
                >
            </Column>
            <Column>
                <p style="font-style: italic;">Generated output will be displayed here on click of "Generate brief" button</p>
                <div style="height: 700px; overflow-y: auto; padding: 10px; background-color:#f4f4f4;">
                    {#if loading}
                    <InlineLoading description="Please wait..." />
                    {/if}
                    {@html marked(brief)}
                </div>
            </Column>
        </Row>
    </Grid>
</Content>
