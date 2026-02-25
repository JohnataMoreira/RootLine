import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

serve(async (req) => {
    try {
        const payload = await req.json()
        const { record } = payload

        // Validate payload
        if (!record || !record.id || !record.storage_path) {
            return new Response(JSON.stringify({ error: "Invalid payload: missing record or storage_path" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            })
        }

        const photo = record
        console.log(`[AI] Processing photo ${photo.id}: ${photo.storage_path}`)

        if (!GEMINI_API_KEY) {
            throw new Error("Missing GEMINI_API_KEY secret")
        }

        // 1. Download image from Supabase Storage using service role client
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

        const { data: imageBlob, error: downloadError } = await supabase
            .storage
            .from('family-photos')
            .download(photo.storage_path)

        if (downloadError || !imageBlob) {
            throw new Error(`Failed to download image: ${downloadError?.message || 'empty blob'}`)
        }

        // Convert to base64
        const arrayBuffer = await imageBlob.arrayBuffer()
        const imageBytes = new Uint8Array(arrayBuffer)
        let binary = ''
        for (let i = 0; i < imageBytes.length; i++) {
            binary += String.fromCharCode(imageBytes[i])
        }
        const imageBase64 = btoa(binary)

        // Detect mime type from filename
        const mimeType = photo.mime_type || (photo.storage_path.endsWith('.png') ? 'image/png' : 'image/jpeg')

        // 2. Call Gemini 2.5 Flash via v1beta (stable release, confirmed in this account's ListModels)
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: `Analise esta foto. Forneça: 
1. "visual_description": Uma breve descrição visual em Português do Brasil (máximo 2 frases).
2. "tags": Array de 3-6 tags em Português do Brasil sobre contexto, pessoas, objetos ou emoções.
3. "detected_objects": Array de objetos identificados.
Retorne APENAS JSON puro, sem markdown. Exemplo: {"visual_description": "Família reunida em volta de uma mesa de jantar.", "tags": ["família", "jantar", "reunião"], "detected_objects": ["mesa", "cadeiras", "pratos"]}`
                        },
                        {
                            inline_data: {
                                mime_type: mimeType,
                                data: imageBase64
                            }
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.4
            }
        }

        const geminiRes = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        })

        if (!geminiRes.ok) {
            const errText = await geminiRes.text()
            throw new Error(`Gemini API Error (${geminiRes.status}): ${errText}`)
        }

        const geminiData = await geminiRes.json()

        if (!geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error(`Gemini returned empty response: ${JSON.stringify(geminiData)}`)
        }

        const resultText = geminiData.candidates[0].content.parts[0].text
        // Strip any markdown fences just in case
        const jsonStr = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const analysis = JSON.parse(jsonStr)

        // 3. Save to photo_analysis table
        const { error: insertError } = await supabase
            .from('photo_analysis')
            .upsert({
                photo_id: photo.id,
                family_id: photo.family_id,
                visual_description: analysis.visual_description,
                tags: analysis.tags || [],
                detected_objects: analysis.detected_objects || [],
                analysis_provider: 'gemini-1.5-flash'
            })

        if (insertError) throw insertError

        console.log(`[AI] ✅ Analysis complete for photo ${photo.id}`)
        return new Response(JSON.stringify({ success: true, photo_id: photo.id, analysis }), {
            headers: { "Content-Type": "application/json" }
        })

    } catch (error) {
        console.error("[AI ERROR]", error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        })
    }
})
