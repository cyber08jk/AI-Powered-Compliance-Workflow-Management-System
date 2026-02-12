const Groq = require('groq-sdk');
const config = require('../config');

/**
 * Generate a root cause summary using Groq AI
 * Falls back to a mock summary if API key is not configured
 */
const generateSummary = async (issueTitle, issueDescription, category, priority) => {
    // If no API key configured, return a mock summary
    if (!config.groqApiKey || config.groqApiKey === 'your_groq_api_key_here') {
        return generateMockSummary(issueTitle, issueDescription, category, priority);
    }

    try {
        console.log('[AIService] Attempting to generate summary with Groq...');
        console.log('[AIService] API Key check:', config.groqApiKey ? 'Present' : 'Missing');
        
        const groq = new Groq({ apiKey: config.groqApiKey });

        const prompt = `You are a compliance expert specializing in root cause analysis for regulated industries (Pharma, MedTech, Manufacturing). 
Analyze the following compliance issue and provide a structured root cause summary including:
1. Root Cause Identification
2. Contributing Factors
3. Impact Assessment
4. Recommended Corrective Actions
5. Preventive Measures

Be concise, professional, and actionable.

Issue Title: ${issueTitle}
Description: ${issueDescription}
Category: ${category}
Priority: ${priority}

Please provide a root cause analysis summary.`;

        const message = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: 'llama-3.1-8b-instant',
        });

        const text = message.choices[0]?.message?.content || '';
        console.log('[AIService] Groq request successful. Length:', text.length);

        return {
            summary: text,
            model: 'llama-3.1-8b-instant',
        };
    } catch (error) {
        console.error('[AIService] API call failed:', error.message);
        console.error('[AIService] Full error:', error);

        // Fallback to mock on failure
        console.warn('[AIService] Falling back to mock summary.');
        return generateMockSummary(issueTitle, issueDescription, category, priority, error.message);
    }
};

/**
 * Generate a mock summary for development/testing
 */
const generateMockSummary = (issueTitle, issueDescription, category, priority, errorMessage = null) => {
    const summary = `## Root Cause Analysis Summary (Mock - Groq)

 Issue: ${issueTitle}

Category: ${category} | Priority: ${priority}

 1. Root Cause Identification
Based on the reported issue, the primary root cause appears to be related to ${category.toLowerCase()} compliance gaps in the current operational workflow. The issue "${issueTitle}" indicates a systematic failure in established protocols.

 2. Contributing Factors
- Inadequate monitoring and detection mechanisms

- ${priority === 'Critical' || priority === 'High' ? 'Immediate attention required due to high-priority classification' : 'Standard review procedures recommended'}

 3. Impact Assessment
- Scope: ${category} compliance area
- Severity: ${priority}
- Regulatory Risk: ${priority === 'Critical' ? 'High — potential regulatory action' : priority === 'High' ? 'Moderate — requires prompt remediation' : 'Low to Moderate'}

 4. Recommended Corrective Actions
1. Conduct thorough investigation of the reported issue
2. Review and update relevant SOPs and work instructions

 5. Preventive Measures
1. Enhance monitoring and early detection systems
2. Conduct targeted training for affected teams


This summary was generated using AI-assisted analysis (Mock Fallback). Please review and validate findings with subject matter experts.`;

    return {
        summary,
        model: 'groq-mock-engine',
        error: errorMessage
    };
};

module.exports = { generateSummary };
