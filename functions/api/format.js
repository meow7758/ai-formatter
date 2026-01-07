export async function onRequestPost(context) {
    const { request, env } = context;
    
    // 从环境变量中获取 DeepSeek API Key (需要在 CF 面板设置)
    const DEEPSEEK_API_KEY = env.DEEPSEEK_API_KEY;
    
    try {
        const { code } = await request.json();

        if (!code) {
            return new Response(JSON.stringify({ error: "No code provided" }), { status: 400 });
        }

        // 调用 DeepSeek API
        const response = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat", // 使用 V3 模型，速度快，适合格式化
                messages: [
                    { 
                        role: "system", 
                        content: "你是一个专业的编程工具。请将用户提供的代码进行格式化。要求：1. 修正缩进和换行。2. 修正基础语法错误。3. 保持逻辑严谨。4. 仅输出格式化后的纯代码，不要任何解释。不要加Markdown标记。" 
                    },
                    { role: "user", content: code }
                ],
                temperature: 0.1
            })
        });

        const result = await response.json();
        const formattedCode = result.choices[0].message.content;

        return new Response(JSON.stringify({ result: formattedCode }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}