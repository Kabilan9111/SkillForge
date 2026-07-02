import os

html_path = 'index.html'

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update grid column proportions to 28fr 44fr 28fr (reduces center width, expands right evaluation width)
old_grid = "grid-template-columns: 30fr 45fr 25fr;"
new_grid = "grid-template-columns: 28fr 44fr 28fr;"
if old_grid in content:
    content = content.replace(old_grid, new_grid)
    print("Updated grid columns to 28fr 44fr 28fr.")

# 2. Extract <div id="wr-live-engine" out of #mock-interview-page / .main-content-area
# Find start of wr-live-engine
start_str = '<div id="wr-live-engine"'
start_idx = content.find(start_str)

if start_idx != -1:
    # Find matching closing tag for wr-live-engine
    # Since we know what comes immediately after wr-live-engine inside mock-interview-page in index.html:
    # Let's check for wr-results-view which follows right after wr-live-engine
    results_str = '<div id="wr-results-view"'
    results_idx = content.find(results_str, start_idx)
    
    if results_idx != -1:
        # Extract the live engine html block
        engine_html = content[start_idx:results_idx]
        # Remove it from inside mock-interview-page
        content = content[:start_idx] + content[results_idx:]
        
        # Place it right before </body> so it sits at root body level, free of .page-view animation transforms!
        body_close = '</body>'
        if body_close in content:
            content = content.replace(body_close, engine_html + '\n' + body_close)
            print("Successfully moved wr-live-engine to direct child of <body>!")
        else:
            content += '\n' + engine_html
            print("Appended wr-live-engine to end of document.")

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 3. Update war-room.js to explicitly hide global-sidebar when liveEngine opens, and restore when closed
js_path = 'war-room.js'
if os.path.exists(js_path):
    with open(js_path, 'r', encoding='utf-8') as f:
        js_content = f.read()
    
    # Check if sidebar logic already present
    if "global-sidebar" not in js_content:
        # When opening live engine:
        open_target = "liveEngine.classList.remove('hidden');"
        open_replacement = """liveEngine.classList.remove('hidden');
                        const globalSidebar = document.getElementById('global-sidebar');
                        if (globalSidebar) globalSidebar.style.display = 'none';"""
        js_content = js_content.replace(open_target, open_replacement)
        
        # When exiting live engine:
        exit_target = "if (liveEngine) liveEngine.classList.add('hidden');"
        exit_replacement = """if (liveEngine) liveEngine.classList.add('hidden');
                const globalSidebar = document.getElementById('global-sidebar');
                if (globalSidebar) globalSidebar.style.display = '';"""
        js_content = js_content.replace(exit_target, exit_replacement)
        
        with open(js_path, 'w', encoding='utf-8') as f:
            f.write(js_content)
        print("Updated war-room.js to hide sidebar during live interview mode.")
    else:
        print("war-room.js already handles global-sidebar.")

print("All architecture and spacing fixes completed successfully!")
