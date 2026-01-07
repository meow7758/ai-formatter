export async function onRequestPost(context) {
    const { request, env } = context;
    
    // 从环境变量中获取 DeepSeek API Key (需要在 CF 面板设置)
    const DEEPSEEK_API_KEY = env.DEEPSEEK_API_KEY;
    
    // 设置响应头，支持 CORS
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };

    try {
        const { code } = await request.json();

        if (!code || code.trim() === "") {
            return new Response(JSON.stringify({ error: "No code provided" }), { 
                status: 400, 
                headers: corsHeaders 
            });
        }

        // 调用 DeepSeek API
        const response = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat", // 使用 V3 模型，性价比最高
                messages: [
                    { 
                        role: "system", 
                        content: "You are a code formatting expert. Please format the provided code. Rules: 1. Fix indentation and line breaks. 2. Fix minor syntax errors. 3. Maintain logic. 4. Output ONLY the formatted code. DO NOT include any explanations or Markdown code block markers (like ```)." 
                    },
                    { role: "user", content: code }
                ],
                temperature: 0.1
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`DeepSeek API error: ${response.status} - ${errorBody}`);
        }

        const result = await response.json();
        const formattedCode = result.choices[0].message.content;

        return new Response(JSON.stringify({ result: formattedCode }), {
            headers: corsHeaders
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500, 
            headers: corsHeaders 
        });
    }
}
