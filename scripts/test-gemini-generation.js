/**
 * Test Gemini API generation directly
 * This bypasses the API routes and calls the AI service directly
 * to see exactly what Gemini returns
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Import the AI service - need to handle TypeScript
async function testGeminiGeneration() {
  try {
    console.log('🧪 Testing Gemini AI Generation Directly\n')

    // Get test user
    const user = await prisma.user.findFirst({
      where: { email: 'faizalmalek667@gmail.com' },
    })

    if (!user) {
      console.log('❌ User not found')
      return
    }

    console.log(`✅ Found user: ${user.email}\n`)

    // Get brand profile
    const profile = await prisma.brandProfile.findUnique({
      where: { userId: user.id },
    })

    if (!profile) {
      console.log('❌ No BrandProfile found. Complete onboarding first.')
      return
    }

    console.log('✅ Brand Profile:')
    console.log(`   Brand: ${profile.brandName}`)
    console.log(`   Industry: ${profile.industry}`)
    console.log(`   Description: ${profile.brandDescription}`)
    console.log(`   Voice: ${profile.brandVoiceDescription}`)
    console.log(`   Goal: ${profile.primaryGoal}\n`)

    // Get existing ideas for deduplication
    const existingIdeas = await prisma.contentIdea.findMany({
      where: { userId: user.id },
      select: { title: true },
    })

    console.log(`📋 Existing ideas (${existingIdeas.length}):`)
    existingIdeas.forEach(idea => {
      console.log(`   - "${idea.title}"`)
    })
    console.log()

    // Manual Gemini API call
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.log('❌ GEMINI_API_KEY not found in environment')
      return
    }

    console.log('🔑 Gemini API Key:', apiKey.substring(0, 20) + '...\n')

    // Build prompt (simplified version of what the service does)
    const existingTitles = existingIdeas.map(i => i.title).join(', ')
    
    const prompt = `You are a content strategist helping brands create engaging social media content.

Brand Information:
- Brand Name: ${profile.brandName}
- Industry: ${profile.industry}
- Brand Description: ${profile.brandDescription}
- Brand Voice: ${profile.brandVoiceDescription}
- Primary Goal: ${profile.primaryGoal}

Generate 6 unique, creative content ideas for this brand.
${existingTitles ? `Avoid these existing titles: ${existingTitles}` : ''}

Return ONLY a valid JSON array with this exact structure:
[
  {
    "title": "Catchy title here",
    "content": "Detailed content description (50+ words)",
    "tags": ["tag1", "tag2", "tag3"],
    "status": "DRAFT"
  }
]

Important:
- Each title must be unique and different from existing titles
- Content must be at least 50 words
- Include 2-4 relevant tags per idea
- Use DRAFT as status
- Return ONLY the JSON array, no extra text`

    console.log('📝 Prompt being sent to Gemini:')
    console.log('─'.repeat(60))
    console.log(prompt)
    console.log('─'.repeat(60))
    console.log()

    console.log('🚀 Calling Gemini API...\n')

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ Gemini API Error:')
      console.log(`   Status: ${response.status}`)
      console.log(`   Response: ${errorText}`)
      return
    }

    const data = await response.json()
    console.log('✅ Gemini API Response received\n')

    // Extract text from response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      console.log('❌ No text in response')
      console.log('Full response:', JSON.stringify(data, null, 2))
      return
    }

    console.log('📄 Raw Gemini Response:')
    console.log('─'.repeat(60))
    console.log(text)
    console.log('─'.repeat(60))
    console.log()

    // Try to parse JSON
    console.log('🔍 Parsing JSON...\n')
    
    // Clean response (remove markdown code blocks if present)
    let cleanedText = text.trim()
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?$/g, '')
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '')
    }

    try {
      const ideas = JSON.parse(cleanedText)
      console.log(`✅ Successfully parsed ${ideas.length} ideas:\n`)

      ideas.forEach((idea, i) => {
        console.log(`${i + 1}. "${idea.title}"`)
        console.log(`   Content: ${idea.content.substring(0, 100)}...`)
        console.log(`   Tags: ${idea.tags.join(', ')}`)
        console.log(`   Status: ${idea.status}`)
        console.log()
      })

      // Check for duplicates
      const normalizedExisting = existingIdeas.map(i => i.title.toLowerCase().trim())
      const duplicates = ideas.filter(idea => 
        normalizedExisting.includes(idea.title.toLowerCase().trim())
      )

      if (duplicates.length > 0) {
        console.log(`⚠️  ${duplicates.length} duplicate titles found:`)
        duplicates.forEach(dup => {
          console.log(`   - "${dup.title}"`)
        })
        console.log()
        console.log('   These would be filtered out by deduplication.')
        console.log(`   ${ideas.length - duplicates.length} unique ideas would be added.`)
      } else {
        console.log(`✅ No duplicates! All ${ideas.length} ideas are unique.`)
      }
      console.log()

    } catch (parseError) {
      console.log('❌ Failed to parse JSON:')
      console.log(parseError.message)
      console.log()
      console.log('Cleaned text that failed to parse:')
      console.log(cleanedText)
    }

  } catch (error) {
    console.error('❌ Test failed:')
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

testGeminiGeneration()
  .then(() => {
    console.log('\n✅ Test complete')
    process.exit(0)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
