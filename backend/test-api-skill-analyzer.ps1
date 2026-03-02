# Test the Evidence-Based Skill Gap Analyzer API
# This script tests the /api/skill-gap/analyze endpoint

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host "TESTING EVIDENCE-BASED SKILL GAP ANALYZER API" -ForegroundColor Yellow
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 79) -ForegroundColor Cyan
Write-Host ""

# Configuration
$API_BASE_URL = "http://localhost:3000/api"
$TEST_USER = @{
    email = "test@example.com"
    password = "Test123!@#"
}

# Step 1: Register/Login to get auth token
Write-Host "Step 1: Authenticating..." -ForegroundColor Cyan

try {
    # Try to login first
    $loginResponse = Invoke-RestMethod -Uri "$API_BASE_URL/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body ($TEST_USER | ConvertTo-Json) `
        -ErrorAction SilentlyContinue
    
    if ($loginResponse.token) {
        $AUTH_TOKEN = $loginResponse.token
        Write-Host "✓ Logged in successfully" -ForegroundColor Green
    }
} catch {
    # If login fails, try to register
    Write-Host "Login failed, attempting registration..." -ForegroundColor Yellow
    
    try {
        $registerBody = @{
            email = $TEST_USER.email
            password = $TEST_USER.password
            firstName = "Test"
            lastName = "User"
        }
        
        $registerResponse = Invoke-RestMethod -Uri "$API_BASE_URL/auth/register" `
            -Method POST `
            -ContentType "application/json" `
            -Body ($registerBody | ConvertTo-Json)
        
        $AUTH_TOKEN = $registerResponse.token
        Write-Host "✓ Registered successfully" -ForegroundColor Green
    } catch {
        Write-Host "✗ Authentication failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Step 2: Create a test resume file
Write-Host "Step 2: Creating test resume..." -ForegroundColor Cyan

$testResumeContent = @"
John Doe - Full Stack Developer
Email: john.doe@example.com | Phone: +1-555-0123
GitHub: https://github.com/johndoe
LinkedIn: https://linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Experienced Full Stack Developer with 5+ years building scalable web applications.
Passionate about clean code, test-driven development, and continuous learning.

TECHNICAL SKILLS
Languages: JavaScript ES6, Python, TypeScript, HTML5, CSS3
Frontend: React.js, Redux, Next.js, Material-UI, Tailwind CSS
Backend: Node.js, Express.js, Django, REST APIs, GraphQL
Databases: PostgreSQL, MongoDB, Redis
DevOps: Docker, AWS (EC2, S3, RDS), CI/CD, GitHub Actions
Tools: Git, npm, Webpack, Jest, Postman

PROFESSIONAL EXPERIENCE

Senior Full Stack Developer | Tech Innovations Inc. | 2021 - Present
• Developed and deployed RESTful APIs using Node.js and Express serving 1M+ requests daily
• Built responsive React applications with TypeScript and state management using Redux
• Implemented JWT-based authentication and role-based access control systems
• Optimized PostgreSQL database queries, reducing average latency by 40%
• Set up CI/CD pipelines using GitHub Actions for automated testing and deployment
• Containerized microservices using Docker and deployed to AWS ECS
• Collaborated with cross-functional teams using Git for version control and code reviews
• Wrote comprehensive unit tests using Jest achieving 85% code coverage

Full Stack Developer | StartupHub | 2019 - 2021
• Created microservices architecture using Node.js, Express, and MongoDB
• Integrated third-party APIs including Stripe for payments and SendGrid for emails
• Implemented server-side rendering with Next.js for improved SEO and performance
• Managed application state using React Hooks and Context API
• Used npm for package management and dependency resolution
• Conducted code reviews and mentored junior developers

PROJECTS

E-Commerce Platform | https://github.com/johndoe/ecommerce-platform
• Built full-stack application with React frontend and Django REST backend
• Implemented real-time inventory updates using WebSockets
• Used Redis for caching and session management
• Deployed on AWS with load balancing and auto-scaling
• Technologies: React, Django, PostgreSQL, Redis, Docker, AWS

Task Management SaaS
• Developed with Next.js for server-side rendering and SEO optimization
• Integrated GraphQL API for efficient data fetching
• Used TypeScript for type safety across frontend and backend
• Implemented OAuth authentication with Google and GitHub providers

EDUCATION
Bachelor of Science in Computer Science
State University | 2015 - 2019
GPA: 3.8/4.0

CERTIFICATIONS
• AWS Certified Solutions Architect - Associate
• MongoDB Certified Developer
"@

$testResumeFile = Join-Path $PSScriptRoot "test-resume.txt"
$testResumeContent | Out-File -FilePath $testResumeFile -Encoding UTF8

Write-Host "✓ Test resume created: $testResumeFile" -ForegroundColor Green
Write-Host ""

# Step 3: Test the skill gap analyzer
Write-Host "Step 3: Analyzing resume..." -ForegroundColor Cyan

try {
    # Prepare multipart form data
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    $fileContent = [System.IO.File]::ReadAllBytes($testResumeFile)
    
    $bodyLines = @(
        "--$boundary",
        "Content-Disposition: form-data; name=`"resume`"; filename=`"test-resume.txt`"",
        "Content-Type: text/plain$LF",
        [System.Text.Encoding]::UTF8.GetString($fileContent),
        "--$boundary",
        "Content-Disposition: form-data; name=`"trackName`"$LF",
        "Full-Stack Developer",
        "--$boundary",
        "Content-Disposition: form-data; name=`"level`"$LF",
        "Intermediate",
        "--$boundary",
        "Content-Disposition: form-data; name=`"trackId`"$LF",
        "1",
        "--$boundary--$LF"
    )
    
    $body = $bodyLines -join $LF
    
    $headers = @{
        "Authorization" = "Bearer $AUTH_TOKEN"
        "Content-Type" = "multipart/form-data; boundary=$boundary"
    }
    
    $response = Invoke-RestMethod -Uri "$API_BASE_URL/skill-gap/analyze" `
        -Method POST `
        -Headers $headers `
        -Body ([System.Text.Encoding]::UTF8.GetBytes($body))
    
    Write-Host "✓ Analysis completed successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Display results
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host ("=" * 79) -ForegroundColor Cyan
    Write-Host "ANALYSIS RESULTS" -ForegroundColor Yellow
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host ("=" * 79) -ForegroundColor Cyan
    Write-Host ""
    
    $analysis = $response.analysis
    
    Write-Host "📄 File: $($analysis.fileName)" -ForegroundColor White
    Write-Host "🎯 Track: $($analysis.trackName) - $($analysis.level)" -ForegroundColor White
    Write-Host "📊 Detection Method: $($analysis.detectionMethod)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "📈 SCORES:" -ForegroundColor Cyan
    Write-Host "  Overall Score: $($analysis.overallScore)%" -ForegroundColor $(if ($analysis.overallScore -ge 70) { "Green" } else { "Yellow" })
    Write-Host "  Coverage Score: $($analysis.coverageScore)%" -ForegroundColor White
    Write-Host "  Readiness Level: $($analysis.readinessLevel)" -ForegroundColor White
    Write-Host "  Time to Ready: $($analysis.estimatedTimeToReady) weeks" -ForegroundColor White
    Write-Host ""
    
    Write-Host "✅ STRONG SKILLS ($($analysis.strong.Count)):" -ForegroundColor Green
    $analysis.strong | Select-Object -First 5 | ForEach-Object {
        Write-Host "  • $($_.skill) (Confidence: $([math]::Round($_.confidence * 100))%, Evidence: $($_.evidenceCount))" -ForegroundColor White
        if ($_.evidence.Count -gt 0) {
            $_.evidence | Select-Object -First 1 | ForEach-Object {
                Write-Host "    → [$($_.type)] $($_.reason)" -ForegroundColor Gray
            }
        }
    }
    if ($analysis.strong.Count -gt 5) {
        Write-Host "  ... and $($analysis.strong.Count - 5) more" -ForegroundColor Gray
    }
    Write-Host ""
    
    if ($analysis.weak.Count -gt 0) {
        Write-Host "⚠️  WEAK SKILLS ($($analysis.weak.Count)):" -ForegroundColor Yellow
        $analysis.weak | Select-Object -First 3 | ForEach-Object {
            Write-Host "  • $($_.skill) (Confidence: $([math]::Round($_.confidence * 100))%)" -ForegroundColor White
        }
        if ($analysis.weak.Count -gt 3) {
            Write-Host "  ... and $($analysis.weak.Count - 3) more" -ForegroundColor Gray
        }
        Write-Host ""
    }
    
    if ($analysis.missing.Count -gt 0) {
        Write-Host "❌ MISSING SKILLS ($($analysis.missing.Count)):" -ForegroundColor Red
        $analysis.missing | Select-Object -First 5 | ForEach-Object {
            Write-Host "  • $($_.skill)" -ForegroundColor White
        }
        if ($analysis.missing.Count -gt 5) {
            Write-Host "  ... and $($analysis.missing.Count - 5) more" -ForegroundColor Gray
        }
        Write-Host ""
    }
    
    Write-Host "🔍 SECTION ANALYSIS:" -ForegroundColor Cyan
    $sections = $analysis.sectionAnalysis
    Write-Host "  Has Experience: $(if ($sections.hasExperience) { '✓' } else { '✗' })" -ForegroundColor $(if ($sections.hasExperience) { "Green" } else { "Red" })
    Write-Host "  Has Projects: $(if ($sections.hasProjects) { '✓' } else { '✗' })" -ForegroundColor $(if ($sections.hasProjects) { "Green" } else { "Red" })
    Write-Host "  Has Skills: $(if ($sections.hasSkills) { '✓' } else { '✗' })" -ForegroundColor $(if ($sections.hasSkills) { "Green" } else { "Red" })
    Write-Host "  Has GitHub: $(if ($sections.hasGithub) { '✓' } else { '✗' })" -ForegroundColor $(if ($sections.hasGithub) { "Green" } else { "Red" })
    if ($sections.githubLinks) {
        $sections.githubLinks | ForEach-Object {
            Write-Host "    → $_" -ForegroundColor Gray
        }
    }
    Write-Host ""
    
    Write-Host "📦 TOTAL DETECTED SKILLS: $($analysis.totalDetected)" -ForegroundColor Cyan
    Write-Host ""
    
    # Show some detected skills with evidence
    if ($analysis.strong.Count -gt 0) {
        Write-Host "🔬 EVIDENCE EXAMPLES:" -ForegroundColor Cyan
        $analysis.strong | Select-Object -First 2 | ForEach-Object {
            Write-Host "  Skill: $($_.skill)" -ForegroundColor White
            $_.evidence | Select-Object -First 2 | ForEach-Object {
                Write-Host "    [$($_.type)] $($_.reason)" -ForegroundColor Gray
                if ($_.lineNumber -ne "N/A" -and $_.line.Length -lt 80) {
                    Write-Host "    Line $($_.lineNumber): `"$($_.line)`"" -ForegroundColor DarkGray
                }
            }
            Write-Host ""
        }
    }
    
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host ("=" * 79) -ForegroundColor Cyan
    Write-Host "✅ TEST COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host ("=" * 79) -ForegroundColor Cyan
    
} catch {
    Write-Host "✗ Analysis failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    exit 1
}

# Cleanup
Remove-Item -Path $testResumeFile -ErrorAction SilentlyContinue
