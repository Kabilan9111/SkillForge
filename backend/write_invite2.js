
const fs = require('fs');
const path = 'F:/SkillForge/backend/src/models/ProjectInvite.js';
let code = fs.readFileSync(path, 'utf8');
code = code.replace(
    /static async updateInviteStatus\\(token, status\\) \\{/,
    \static async processPendingInvitesForEmail(email, userId) {
        const pending = await db.all('SELECT * FROM project_invites WHERE email = ? AND status = \\'pending\\'', [email]);
        for (const invite of pending) {
            await ProjectInvite.addContributor(invite.project_id, userId, 'accepted');
            await ProjectInvite.updateInviteStatus(invite.token, 'accepted');
        }
    }

    static async updateInviteStatus(token, status) {\
);
fs.writeFileSync(path, code);

