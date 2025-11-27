# AI Content Generation Debugging Guide

## Changes Made

### 1. Enhanced Status Message Visibility
**File**: `src/app/(app)/dashboard/page.tsx`

- **Before**: Small, plain green message that was hard to notice
- **After**: Large, prominent message with:
  - ✨ Icon and checkmark
  - Bold "Content Generated Successfully!" heading
  - Gradient background (emerald-50 to emerald-100)
  - 2px border and shadow
  - Larger, more readable text

### 2. Added Comprehensive Logging
**Files**: 
- `src/app/(app)/dashboard/page.tsx`
- `src/services/content-vault-ai.ts`

Added console.log statements throughout the generation flow to track:
- When generation starts
- API response status
- Generation results (ideas/templates count)
- Brand profile retrieval
- Gemini API calls and responses
- Deduplication process
- Database insertion

### 3. Fixed TypeScript Type Errors
**File**: `src/services/content-vault-ai.ts`

Fixed type casting issues for Prisma database insertions:
- Cast `status` to `ContentIdeaStatus` type
- Cast `structure` to `Prisma.InputJsonValue` type

## How to Debug

### Step 1: Check Console Logs
After clicking "Generate New Content Ideas":

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for these log messages:

```
[Dashboard] Starting content generation...
[Dashboard] API response status: 200
[Dashboard] Generation result: { addedIdeas: X, addedTemplates: Y, ... }
[Dashboard] Setting status message: Added X ideas and Y templates...
```

Server logs will show:
```
[AI Service] Starting generation for user: xxx
[AI Service] Limits - Ideas: 6, Templates: 3
[AI Service] Brand profile: { brandName: '...', industry: '...' }
[Gemini] API Key present: true
[Gemini] Initializing API...
[Gemini] Sending prompt...
[Gemini] Raw response length: XXX
[Gemini] Parsed ideas count: X
[Gemini] Parsed templates count: X
[AI Service] Provider ideas before dedup: X
[AI Service] Deduped ideas: X
```

### Step 2: Check Brand Profile
If you see "Brand profile not found", you need to complete onboarding:
1. Go to `/onboarding`
2. Fill in all brand information
3. Complete the wizard
4. Try generating again

### Step 3: Verify Gemini API Key
Check your `.env.local` file has:
```
GEMINI_API_KEY=AIzaSyBhCo7Xjlx_jZ7KQMW9wJ5rL4nH3gK2fP8
```

Test the key manually:
```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Generate 3 content ideas"}]}]}'
```

### Step 4: Check for Duplicate Titles
If logs show ideas generated but 0 added:
- The system deduplicates based on existing titles
- Check Content Vault for existing ideas
- Try deleting some old ideas
- Generation will skip duplicates

### Common Issues

#### Issue: "0 ideas and 0 templates"
**Causes**:
1. No brand profile → Complete onboarding
2. Invalid Gemini API key → Check `.env.local`
3. All generated titles are duplicates → Clear some vault items
4. Gemini API error → Check server logs for "[Gemini]" errors

#### Issue: Message not visible
**Solution**: Message is now much more prominent with:
- Larger size
- Gradient background
- Bold text
- Icon
Should appear right below the "Generate" button

#### Issue: Generation slow or times out
**Solution**: 
- Default limits: 6 ideas, 3 templates
- Reduce limits in API call if needed
- Check Gemini API quota

## Testing Checklist

- [ ] Click "Generate New Content Ideas"
- [ ] See loading overlay with "Generating content" message
- [ ] Check browser console for `[Dashboard]` logs
- [ ] Check server console for `[AI Service]` and `[Gemini]` logs
- [ ] Verify green success message appears prominently
- [ ] Open Content Vault to see new ideas
- [ ] Check that ideas have AI-generated content (150-220 words)
- [ ] Verify templates have structure/outline

## Next Steps

1. **Start dev server** with fresh logs:
   ```powershell
   taskkill /F /IM node.exe /T 2>$null
   npm run dev
   ```

2. **Test generation**:
   - Navigate to `/dashboard`
   - Click "Generate New Content Ideas"
   - Watch console for detailed logs

3. **Review results**:
   - Check the prominent success message
   - Open Content Vault
   - Verify ideas were added

4. **If still 0 results**:
   - Share console logs (both browser and server)
   - Check brand profile exists
   - Verify Gemini API key is valid
   - Try deleting existing vault items to avoid deduplication
